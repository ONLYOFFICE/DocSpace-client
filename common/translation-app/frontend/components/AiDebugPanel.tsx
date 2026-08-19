"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

interface DebugState {
  systemPrompt: string;
  userPrompt: string;
  targetLanguage: string;
  key: string;
  namespace: string;
  thinkingText: string;
  responseText: string;
}

interface AiDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiDebugPanel: React.FC<AiDebugPanelProps> = ({ isOpen, onClose }) => {
  const [debug, setDebug] = useState<DebugState | null>(null);
  const [promptCollapsed, setPromptCollapsed] = useState(true);
  const [panelHeight, setPanelHeight] = useState(300);
  const [isTranslating, setIsTranslating] = useState(false);

  const thinkingRef = useRef("");
  const responseRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const outputScrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const promptTimestampRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const flushDebugText = useCallback(() => {
    rafRef.current = null;
    setDebug((prev) =>
      prev
        ? { ...prev, thinkingText: thinkingRef.current, responseText: responseRef.current }
        : prev,
    );
  }, []);

  // Socket subscriptions — no jobId filter: show whatever is currently translating
  useEffect(() => {
    const socket = getSocket();

    const onPrompt = (data: any) => {
      thinkingRef.current = "";
      responseRef.current = "";
      promptTimestampRef.current = Date.now();
      setElapsed(0);
      setIsTranslating(true);
      setDebug({
        systemPrompt: data.systemPrompt ?? "",
        userPrompt: data.userPrompt ?? "",
        targetLanguage: data.targetLanguage ?? "",
        key: data.key ?? "",
        namespace: data.namespace ?? "",
        thinkingText: "",
        responseText: "",
      });
      setPromptCollapsed(true);
    };

    const onToken = (data: any) => {
      if (data.isThinking) {
        thinkingRef.current += data.token;
      } else {
        responseRef.current += data.token;
      }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushDebugText);
      }
    };

    const onResult = (data: any) => {
      thinkingRef.current = data.thinkingText ?? thinkingRef.current;
      responseRef.current = data.result ?? responseRef.current;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsTranslating(false);
      flushDebugText();
    };

    const onAborted = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsTranslating(false);
      setDebug((prev) =>
        prev ? { ...prev, responseText: prev.responseText + "\n\n[Aborted]" } : prev,
      );
    };

    socket.on("translation:debug:prompt", onPrompt);
    socket.on("translation:debug:token", onToken);
    socket.on("translation:debug:result", onResult);
    socket.on("translation:debug:aborted", onAborted);

    return () => {
      socket.off("translation:debug:prompt", onPrompt);
      socket.off("translation:debug:token", onToken);
      socket.off("translation:debug:result", onResult);
      socket.off("translation:debug:aborted", onAborted);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [flushDebugText]);

  // Tick elapsed-time counter while waiting for first token
  useEffect(() => {
    if (!debug || debug.thinkingText || debug.responseText) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - promptTimestampRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [debug, debug?.thinkingText, debug?.responseText]);

  // Auto-scroll output to bottom on new content
  useEffect(() => {
    if (isOpen && outputScrollRef.current) {
      outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
    }
  }, [debug?.thinkingText, debug?.responseText, isOpen]);

  // Drag-to-resize handle
  const onDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - e.clientY;
      setPanelHeight(Math.max(160, Math.min(window.innerHeight * 0.8, dragStartHeight.current + delta)));
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  const outputHeight = panelHeight - 80; // subtract header + prompt-toggle bar

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-gray-950 border-t border-gray-700 shadow-2xl"
      style={{ height: panelHeight }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        className="h-1.5 w-full cursor-row-resize bg-gray-800 hover:bg-primary-600 transition-colors flex-shrink-0"
        title="Drag to resize"
      />

      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <span className="text-primary-400">⬡</span>
          AI Debug
        </span>

        {debug ? (
          <span className="text-xs font-mono text-gray-500 truncate">
            {debug.targetLanguage && (
              <span className="text-amber-400 mr-1">{debug.targetLanguage}</span>
            )}
            {debug.namespace && (
              <span className="text-gray-400">{debug.namespace}/</span>
            )}
            <span className="text-gray-300">{debug.key}</span>
          </span>
        ) : (
          <span className="text-xs text-gray-600 italic">waiting for translation…</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isTranslating && (
            <button
              onClick={() => getSocket().emit("translation:debug:stop")}
              className="text-xs text-red-400 hover:text-red-200 px-2 py-0.5 rounded hover:bg-red-900/40 border border-red-800 flex items-center gap-1"
              title="Abort current translation"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Stop
            </button>
          )}
          <button
            onClick={() => setDebug(null)}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded hover:bg-gray-800"
            title="Clear output"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 p-1 rounded hover:bg-gray-800"
            title="Close panel"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content: two columns — Prompt | Output */}
      <div className="flex flex-1 overflow-hidden text-xs font-mono">
        {/* Left: Prompt */}
        <div className="flex flex-col w-80 flex-shrink-0 border-r border-gray-800">
          <button
            onClick={() => setPromptCollapsed((c) => !c)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 text-left flex-shrink-0"
          >
            <span>{promptCollapsed ? "▸" : "▾"}</span>
            <span className="font-semibold text-gray-300">Prompt</span>
            {debug?.userPrompt && (
              <span className="ml-auto text-gray-600 truncate max-w-[140px]" title={debug.userPrompt}>
                {debug.userPrompt.slice(0, 40)}{debug.userPrompt.length > 40 ? "…" : ""}
              </span>
            )}
          </button>

          {!promptCollapsed && (
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 bg-gray-950">
              {debug ? (
                <>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-purple-400 font-semibold mb-1">
                      System
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-400 text-[11px] leading-relaxed">
                      {debug.systemPrompt}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-blue-400 font-semibold mb-1">
                      User
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-300 text-[11px] leading-relaxed">
                      {debug.userPrompt}
                    </pre>
                  </div>
                </>
              ) : (
                <span className="text-gray-600 italic">Start a translation to see the prompt.</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Thinking + Response stream */}
        <div ref={outputScrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-gray-950">
          {!debug && (
            <span className="text-gray-600 italic">
              Click the AI button on any translation row, or start a project translation, to see live model output here.
            </span>
          )}

          {debug?.thinkingText && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-amber-500 font-semibold mb-1">
                Thinking
              </div>
              <pre className="whitespace-pre-wrap text-gray-500 italic text-[11px] leading-relaxed">
                {debug.thinkingText}
              </pre>
            </div>
          )}

          {debug?.responseText && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-green-400 font-semibold mb-1">
                Response
              </div>
              <pre className="whitespace-pre-wrap text-gray-200 text-[11px] leading-relaxed">
                {debug.responseText}
              </pre>
            </div>
          )}

          {debug && !debug.thinkingText && !debug.responseText && (
            <div className="flex items-center gap-2 text-gray-500 italic">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Waiting for model…</span>
              {elapsed > 0 && (
                <span className="text-amber-500 not-italic font-mono">{elapsed}s</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiDebugPanel;
