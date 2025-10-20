// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
