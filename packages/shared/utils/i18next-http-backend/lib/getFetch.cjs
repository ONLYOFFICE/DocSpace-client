/* eslint-disable global-require */
let fetchApi;
if (typeof fetch === "function") {
  if (typeof global !== "undefined" && global.fetch) {
    fetchApi = global.fetch;
  } else if (typeof window !== "undefined" && window.fetch) {
    fetchApi = window.fetch;
  }
}

if (
  typeof require !== "undefined" &&
  (typeof window === "undefined" || typeof window.document === "undefined")
) {
  let f = fetchApi || require("cross-fetch");
  if (f.default) f = f.default;
  exports.default = f;
  module.exports = exports.default;
}
