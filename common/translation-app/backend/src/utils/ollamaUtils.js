const { ollamaConfig } = require("../config/config");

/**
 * Verify Ollama service is reachable
 * @returns {Promise<boolean>}
 */
async function verifyOllamaConnection() {
  try {
    const response = await fetch(`${ollamaConfig.apiUrl}/api/tags`);
    if (!response.ok) {
      console.log(
        `Ollama connection failed: ${response.status} ${response.statusText}`
      );
      return false;
    }
    await response.json();
    return true;
  } catch (error) {
    console.log(`Ollama connection error: ${error.message}`);
    return false;
  }
}

/**
 * Wraps a promise with a timeout rejection
 * @param {Promise} promise
 * @param {number} ms - timeout in milliseconds
 */
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Ollama request timed out after ${ms}ms`)),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}

module.exports = { verifyOllamaConnection, withTimeout };
