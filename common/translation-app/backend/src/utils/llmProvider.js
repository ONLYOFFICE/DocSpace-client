/**
 * LLM Provider abstraction — Ollama and OpenRouter (OpenAI-compatible).
 *
 * Provides a unified interface for:
 *   - Streaming chat (async generator yielding { content, thinking } tokens)
 *   - Non-streaming chat (returns full message)
 *   - Model listing
 *   - Connection verification
 *
 * Provider is auto-detected from the model name:
 *   - Contains "/" → OpenRouter  (e.g. "google/gemma-4-26b-a4b-it")
 *   - Otherwise   → Ollama      (e.g. "gemma4:latest")
 */

const { ollamaConfig, openRouterConfig } = require("../config/config");

// ─── Repetition loop detector ─────────────────────────────────────────────────

/**
 * Detects when a model enters a repetition loop (e.g. "The correct translation is X.
 * The correct translation is X. The correct translation is X. ...").
 *
 * Maintains a sliding window of recent text. When the same phrase repeats
 * more than `maxRepeats` times, returns true.
 */
class RepetitionDetector {
  constructor({ maxRepeats = 3, windowSize = 3000 } = {}) {
    this.maxRepeats = maxRepeats;
    this.windowSize = windowSize;
    this.buffer = "";
  }

  /**
   * Feed new text and check for loops.
   * Looks for any substring of 15+ chars that appears maxRepeats+ times in the buffer.
   * @param {string} text - New token(s)
   * @returns {boolean} true if repetition loop detected
   */
  feed(text) {
    this.buffer += text;
    if (this.buffer.length > this.windowSize) {
      this.buffer = this.buffer.slice(-this.windowSize);
    }

    const buf = this.buffer;
    if (buf.length < 100) return false;

    // Take the last N chars as candidate pattern, then count occurrences in buffer
    for (const patLen of [150, 80, 40, 20]) {
      if (buf.length < patLen * 2) continue;
      const pattern = buf.slice(-patLen);

      let count = 0;
      let pos = 0;
      while ((pos = buf.indexOf(pattern, pos)) !== -1) {
        count++;
        pos += patLen;
      }

      if (count >= this.maxRepeats) return true;
    }

    return false;
  }
}
const { Ollama } = require("ollama");
const { verifyOllamaConnection } = require("./ollamaUtils");

// ─── Provider detection ───────────────────────────────────────────────────────

function isOpenRouterModel(model) {
  return model && model.includes("/");
}

function getProviderName(model) {
  return isOpenRouterModel(model) ? "openrouter" : "ollama";
}

// ─── Connection verification ──────────────────────────────────────────────────

async function verifyConnection(model) {
  if (isOpenRouterModel(model)) {
    return verifyOpenRouterConnection();
  }
  return verifyOllamaConnection();
}

async function verifyOpenRouterConnection() {
  if (!openRouterConfig.apiKey) {
    console.log("OpenRouter: API key not configured");
    return false;
  }
  try {
    const response = await fetch(`${openRouterConfig.apiUrl}/models`, {
      headers: { Authorization: `Bearer ${openRouterConfig.apiKey}` },
    });
    if (!response.ok) {
      console.log(
        `OpenRouter connection failed: ${response.status} ${response.statusText}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.log(`OpenRouter connection error: ${error.message}`);
    return false;
  }
}

// ─── Model listing ────────────────────────────────────────────────────────────

async function listOllamaModels() {
  const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });
  const { models } = await ollamaClient.list();
  return (models || []).map((m) => ({
    id: m.name || m.model,
    name: m.name || m.model,
    provider: "ollama",
    ...m,
  }));
}

async function listOpenRouterModels() {
  const response = await fetch(`${openRouterConfig.apiUrl}/models`, {
    headers: { Authorization: `Bearer ${openRouterConfig.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`OpenRouter models error: ${response.status}`);
  }
  const data = await response.json();
  return (data.data || []).map((m) => ({
    // "name" must be the model ID (e.g. "google/gemma-4-26b-a4b-it)
    // because the frontend passes model.name to the backend,
    // and isOpenRouterModel() detects the "/" to route to OpenRouter.
    id: m.id,
    name: m.id,
    displayName: m.name || m.id,
    provider: "openrouter",
    context_length: m.context_length,
  }));
}

// ─── Streaming chat ───────────────────────────────────────────────────────────

/**
 * Create a streaming chat completion.
 * Returns an object with:
 *   - stream: async iterable yielding { content, thinking } tokens
 *   - abort(): function to cancel the stream
 *
 * @param {string} model - Model identifier
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} [options]
 * @param {number} [options.temperature=0.1]
 * @param {number} [options.maxTokens=8192]
 * @param {boolean} [options.think=true] - Request thinking/reasoning output (Ollama only)
 * @returns {Promise<{stream: AsyncIterable<{content: string, thinking: string}>, abort: Function}>}
 */
async function createStreamingChat(model, messages, options = {}) {
  const result = isOpenRouterModel(model)
    ? await createOpenRouterStream(model, messages, options)
    : await createOllamaStream(model, messages, options);

  // Wrap stream with repetition loop detection.
  // If the model enters a loop (same phrase repeated 4+ times), abort automatically.
  const detector = new RepetitionDetector();
  const innerStream = result.stream;

  const guardedStream = {
    [Symbol.asyncIterator]() {
      const iterator = innerStream[Symbol.asyncIterator]();
      return {
        async next() {
          const item = await iterator.next();
          if (item.done) return item;
          const { content, thinking } = item.value;
          if (content && detector.feed(content)) {
            console.warn("[llmProvider] Repetition loop detected — aborting stream");
            result.abort();
            return { done: true, value: undefined };
          }
          return item;
        },
      };
    },
  };

  return { ...result, stream: guardedStream };
}

async function createOllamaStream(model, messages, options = {}) {
  const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });
  const stream = await ollamaClient.chat({
    model,
    messages,
    stream: true,
    think: options.think !== false,
    options: {
      temperature: options.temperature ?? 0.1,
      num_predict: options.maxTokens ?? 8192,
    },
  });

  // Wrap Ollama's AbortableAsyncIterator to unified format
  const asyncIterable = {
    [Symbol.asyncIterator]() {
      const iterator = stream[Symbol.asyncIterator]();
      return {
        async next() {
          const result = await iterator.next();
          if (result.done) return { done: true, value: undefined };
          const chunk = result.value;
          return {
            done: false,
            value: {
              content: chunk.message?.content ?? "",
              thinking: chunk.message?.thinking ?? "",
            },
          };
        },
      };
    },
  };

  return {
    stream: asyncIterable,
    abort: () => stream.abort(),
    raw: stream, // Expose raw stream for currentOllamaStream tracking
  };
}

async function createOpenRouterStream(model, messages, options = {}) {
  const controller = new AbortController();

  const response = await fetch(`${openRouterConfig.apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterConfig.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.maxTokens ?? 8192,
      stream: true,
      // Request extended thinking/reasoning output from models that support it.
      // Models that don't support it will ignore this field.
      include_reasoning: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${body}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const asyncIterable = {
    [Symbol.asyncIterator]() {
      let buffer = "";
      let done = false;

      return {
        async next() {
          while (!done) {
            const result = await reader.read();
            if (result.done) {
              done = true;
              // Process remaining buffer
              if (buffer.trim()) {
                const token = parseSSELine(buffer);
                if (token) return { done: false, value: token };
              }
              return { done: true, value: undefined };
            }

            buffer += decoder.decode(result.value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const token = parseSSELine(line);
              if (token && (token.content || token.thinking)) {
                return { done: false, value: token };
              }
            }
          }
          return { done: true, value: undefined };
        },
      };
    },
  };

  return {
    stream: asyncIterable,
    abort: () => controller.abort(),
    raw: null,
  };
}

function parseSSELine(line) {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith("data: ")) return null;
  const data = trimmed.slice(6);
  if (data === "[DONE]") return null;
  try {
    const parsed = JSON.parse(data);
    const delta = parsed.choices?.[0]?.delta;
    if (!delta) return null;
    return {
      content: delta.content || "",
      thinking: delta.reasoning || delta.reasoning_content || "",
    };
  } catch {
    return null;
  }
}

// ─── Non-streaming chat ───────────────────────────────────────────────────────

/**
 * Non-streaming chat completion. Returns the full message content.
 *
 * @param {string} model
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} [options]
 * @param {number} [options.temperature=0]
 * @param {number} [options.maxTokens=8192]
 * @param {number} [options.timeout] - Request timeout in ms
 * @returns {Promise<string>} The assistant's message content
 */
async function completionChat(model, messages, options = {}) {
  if (isOpenRouterModel(model)) {
    return openRouterCompletion(model, messages, options);
  }
  return ollamaCompletion(model, messages, options);
}

async function ollamaCompletion(model, messages, options = {}) {
  const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });
  const timeout = options.timeout || ollamaConfig.requestTimeout;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Ollama request timed out after ${timeout}ms`)),
      timeout,
    ),
  );

  const { message } = await Promise.race([
    ollamaClient.chat({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0,
        num_ctx: options.maxTokens ?? 8192,
      },
    }),
    timeoutPromise,
  ]);

  return message.content;
}

async function openRouterCompletion(model, messages, options = {}) {
  const timeout = options.timeout || 120000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(
      `${openRouterConfig.apiUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterConfig.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 8192,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } finally {
    clearTimeout(timer);
  }
}

// ─── Streaming fetch (for correctScriptIfNeeded-style raw streaming) ──────────

/**
 * Raw streaming fetch — returns a reader-based stream.
 * For Ollama: JSONL stream from /api/chat
 * For OpenRouter: SSE stream from /chat/completions
 *
 * @param {string} model
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} [options]
 * @param {AbortController} [options.abortController]
 * @returns {Promise<{reader: ReadableStreamDefaultReader, parseToken: Function}>}
 */
async function createRawStream(model, messages, options = {}) {
  const abortController = options.abortController || new AbortController();

  if (isOpenRouterModel(model)) {
    const response = await fetch(
      `${openRouterConfig.apiUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterConfig.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.1,
          stream: true,
        }),
        signal: abortController.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `OpenRouter HTTP error during correction: ${response.status}`,
      );
    }

    return {
      reader: response.body.getReader(),
      parseToken: (line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) return "";
        const data = trimmed.slice(6);
        if (data === "[DONE]") return "";
        try {
          const parsed = JSON.parse(data);
          return parsed.choices?.[0]?.delta?.content || "";
        } catch {
          return "";
        }
      },
    };
  }

  // Ollama: JSONL stream
  const response = await fetch(`${ollamaConfig.apiUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature: options.temperature ?? 0.1 },
    }),
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama HTTP error during correction: ${response.status}`);
  }

  return {
    reader: response.body.getReader(),
    parseToken: (line) => {
      if (!line.trim()) return "";
      try {
        const data = JSON.parse(line);
        return data.message?.content ?? "";
      } catch {
        return "";
      }
    },
  };
}

module.exports = {
  isOpenRouterModel,
  getProviderName,
  verifyConnection,
  verifyOpenRouterConnection,
  listOllamaModels,
  listOpenRouterModels,
  createStreamingChat,
  completionChat,
  createRawStream,
};

