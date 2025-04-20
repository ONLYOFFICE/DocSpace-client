/**
 * Export all repositories from a single module
 */

// Database repositories
const translationsMetadata = require('./translations-metadata');
const figmaReferences = require('./figma-references');
const comments = require('./comments');
const codeUsages = require('./code-usages');
const approvals = require('./approvals');
const history = require('./history');

module.exports = {
  translationsMetadata,
  figmaReferences,
  comments,
  codeUsages,
  approvals,
  history
};
