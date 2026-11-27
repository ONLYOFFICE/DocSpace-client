// A module with no exports, for a Node-only package that a library imports
// but never reaches in the browser. It is CommonJS on purpose: named imports
// from an ES module are checked at build time, and an empty one would fail
// the build for every name the importer asks for.
module.exports = {};
