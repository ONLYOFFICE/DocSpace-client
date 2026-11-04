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

// Browser extensions that act on a text selection (dictionaries, translators,
// highlighters - e.g. Lingualeo) wrap the selected range with
// Range.surroundContents. That splits the text node React rendered into: React
// keeps its node, now holding only the part before the selection, and the rest
// moves into nodes React does not know about. When React later changes or
// removes its node, those leftovers stay on screen ("New titleOld title").
//
// The guard remembers React text nodes split this way and drops the foreign
// leftovers right after React touches the node again. Until then the DOM is
// left as the extension made it, so its popup and the selection keep working.
//
// Only text rendered next to siblings is affected: a string that is the only
// child of an element is updated through textContent, which wipes foreign
// nodes by itself.

const REACT_FIBER_PREFIX = "__reactFiber$";

let installed = false;

const isReactNode = (node: Node) =>
  Object.keys(node).some((key) => key.startsWith(REACT_FIBER_PREFIX));

const containsReactNode = (node: Node) => {
  if (isReactNode(node)) return true;

  const walker = document.createTreeWalker(node);
  while (walker.nextNode()) {
    if (isReactNode(walker.currentNode)) return true;
  }

  return false;
};

// Removes the foreign nodes that follow `start`, up to the next node React
// owns. A foreign wrapper that holds React nodes is left alone: removing it
// would take React's nodes with it.
const removeForeignTail = (start: Node | null) => {
  let node = start;

  while (node && !containsReactNode(node)) {
    const next = node.nextSibling;
    node.parentNode?.removeChild(node);
    node = next;
  }
};

export const createForeignTextGuard = (root: Node) => {
  const splitTexts = new WeakSet<Node>();

  const observer = new MutationObserver((records) => {
    const foreignAdded = new Set<Node>();
    const changedTexts = new Set<Node>();

    records.forEach((record) => {
      if (record.type === "characterData") {
        if (isReactNode(record.target)) changedTexts.add(record.target);
        return;
      }

      record.addedNodes.forEach((node) => {
        if (!isReactNode(node)) foreignAdded.add(node);
      });

      // React removed a split node: its leftovers now follow the node that
      // was in front of it.
      record.removedNodes.forEach((node) => {
        if (!splitTexts.has(node)) return;
        splitTexts.delete(node);
        removeForeignTail(record.nextSibling);
      });
    });

    changedTexts.forEach((text) => {
      if (!text.isConnected) return;

      const next = text.nextSibling;

      if (next && foreignAdded.has(next)) {
        // the split itself: shortened by foreign code, foreign nodes after it
        splitTexts.add(text);
        return;
      }

      if (!splitTexts.has(text)) return;

      // React updated a node that was split earlier
      splitTexts.delete(text);
      removeForeignTail(next);
    });
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
  });

  return () => observer.disconnect();
};

export const installForeignTextGuard = (): void => {
  if (installed || typeof window === "undefined") return;
  if (typeof MutationObserver === "undefined") return;
  installed = true;

  createForeignTextGuard(document.documentElement);
};
