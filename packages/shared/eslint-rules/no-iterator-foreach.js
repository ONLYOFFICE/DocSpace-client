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

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow forEach on iterators for Safari compatibility",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      noIteratorForEach:
        "Iterator.forEach() is not supported in Safari < 18. Use Array.from({{iterator}}).forEach()",
      noIteratorForEachVariable:
        "Variable '{{variable}}' contains an iterator from {{method}}(). Using forEach on iterators is not supported in Safari < 18. Use Array.from()",
    },
  },

  create(context) {
    const iteratorVariables = new Map();

    return {
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === "CallExpression" &&
          node.init.callee.type === "MemberExpression" &&
          node.init.callee.property.type === "Identifier"
        ) {
          const methodName = node.init.callee.property.name;
          const objectName = node.init.callee.object;

          if (
            objectName.type === "Identifier" &&
            objectName.name === "Object"
          ) {
            return;
          }

          if (
            methodName === "values" ||
            methodName === "keys" ||
            methodName === "entries"
          ) {
            if (node.id.type === "Identifier") {
              iteratorVariables.set(node.id.name, {
                method: methodName,
                sourceText: context.getSourceCode().getText(node.init),
              });
            }
          }
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "forEach"
        ) {
          const object = node.callee.object;

          // Pattern 1: Direct chaining like map.values().forEach()
          if (
            object.type === "CallExpression" &&
            object.callee.type === "MemberExpression" &&
            object.callee.property.type === "Identifier"
          ) {
            const methodName = object.callee.property.name;
            const objectName = object.callee.object;

            if (
              objectName.type === "Identifier" &&
              objectName.name === "Object"
            ) {
              return;
            }

            if (
              methodName === "values" ||
              methodName === "keys" ||
              methodName === "entries"
            ) {
              context.report({
                node,
                messageId: "noIteratorForEach",
                data: {
                  iterator: context.getSourceCode().getText(object),
                },
                fix(fixer) {
                  const sourceCode = context.getSourceCode();
                  const iteratorText = sourceCode.getText(object);
                  const forEachArgs = node.arguments
                    .map((arg) => sourceCode.getText(arg))
                    .join(", ");

                  return fixer.replaceText(
                    node,
                    `Array.from(${iteratorText}).forEach(${forEachArgs})`,
                  );
                },
              });
            }
          }

          // Pattern 2: Variable holding iterator result like items.forEach()
          else if (object.type === "Identifier") {
            const variableName = object.name;
            const iteratorInfo = iteratorVariables.get(variableName);

            if (iteratorInfo) {
              context.report({
                node,
                messageId: "noIteratorForEachVariable",
                data: {
                  variable: variableName,
                  method: iteratorInfo.method,
                },
                fix(fixer) {
                  const sourceCode = context.getSourceCode();
                  const forEachArgs = node.arguments
                    .map((arg) => sourceCode.getText(arg))
                    .join(", ");

                  return fixer.replaceText(
                    node,
                    `Array.from(${variableName}).forEach(${forEachArgs})`,
                  );
                },
              });
            }
          }
        }
      },
    };
  },
};
