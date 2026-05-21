/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * ESLint rule to detect non-ASCII characters in code
 * Uses simple regex /[^\x00-\x7F]/g to find all non-ASCII characters
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow non-ASCII characters in code",
      category: "Possible Errors",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          allowedCharacters: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of allowed non-ASCII characters",
          },
          ignoreFiles: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of file patterns to ignore",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      nonAsciiFound: "Non-ASCII characters found: {{characters}}",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedCharacters = new Set(options.allowedCharacters || []);
    const ignoreFiles = options.ignoreFiles || [];

    const filename = context.getFilename();
    const shouldIgnore = ignoreFiles.some((pattern) =>
      filename.includes(pattern),
    );

    if (shouldIgnore) {
      return {};
    }

    // biome-ignore lint/suspicious/noControlCharactersInRegex: TODO fix
    const nonAsciiRegex = /[^\x00-\x7F]/g;

    function checkText(node, text) {
      let match;
      const foundCharacters = [];
      nonAsciiRegex.lastIndex = 0;

      while ((match = nonAsciiRegex.exec(text)) !== null) {
        const char = match[0];

        if (allowedCharacters.has(char)) {
          continue;
        }

        foundCharacters.push(`${char}`);
      }

      if (foundCharacters.length > 0) {
        context.report({
          node,
          messageId: "nonAsciiFound",
          data: {
            characters: foundCharacters.join(", "),
          },
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") {
          checkText(node, node.raw);
        }
      },

      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          checkText(node, quasi.value.raw);
        });
      },

      Identifier(node) {
        checkText(node, node.name);
      },

      Program() {
        const sourceCode = context.getSourceCode();
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          checkText(comment, comment.value);
        });
      },
    };
  },
};
