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
 * The formatting the toolbar over a skill's instructions applies: Markdown
 * marks put around the selection, or at the start of every selected line.
 */

export type TMarkdownAction =
  | "bold"
  | "italic"
  | "heading"
  | "bulleted"
  | "numbered"
  | "code"
  | "link";

export type TMarkdownEdit = {
  /** The range of the text that is replaced. */
  from: number;
  to: number;
  insert: string;
  /** What is selected after the edit. */
  anchor: number;
  head: number;
};

const WRAPS: Partial<Record<TMarkdownAction, string>> = {
  bold: "**",
  italic: "_",
  code: "`",
};

const LINK_URL = "https://";

const linePrefix = (action: TMarkdownAction, index: number): string =>
  action === "heading" ? "## " : action === "numbered" ? `${index + 1}. ` : "- ";

const LINE_MARK = /^(#{1,6} |[-*+] |\d+\. )/;

/**
 * The edit an action makes of the text with `from`..`to` selected. A mark
 * already around the selection, or at the start of every selected line, is
 * taken off: the buttons toggle.
 */
export const getMarkdownEdit = (
  text: string,
  from: number,
  to: number,
  action: TMarkdownAction,
): TMarkdownEdit => {
  // An inline mark goes around the text only: the spaces and line breaks
  // at the ends of the selection, such as the break a triple click takes
  // with its line, stay outside it, or the closing mark would open the
  // next line.
  const selected = text.slice(from, to);
  const lead = selected.length - selected.trimStart().length;
  const inner = selected.trim();
  // A selection of blanks only is marked where it starts.
  const innerFrom = inner ? from + lead : from;
  const innerTo = innerFrom + inner.length;

  const wrap = WRAPS[action];
  if (wrap) {
    const size = wrap.length;
    const isWrapped =
      text.slice(innerFrom - size, innerFrom) === wrap &&
      text.slice(innerTo, innerTo + size) === wrap;
    if (isWrapped)
      return {
        from: innerFrom - size,
        to: innerTo + size,
        insert: inner,
        anchor: innerFrom - size,
        head: innerTo - size,
      };
    // A whole marked line, selected with its marks, is taken off too.
    const unwrapped = inner.slice(size, -size);
    const isMarkedText =
      inner.length > size * 2 &&
      inner.startsWith(wrap) &&
      inner.endsWith(wrap) &&
      !unwrapped.includes(wrap);
    if (isMarkedText)
      return {
        from: innerFrom,
        to: innerTo,
        insert: unwrapped,
        anchor: innerFrom,
        head: innerFrom + unwrapped.length,
      };
    return {
      from: innerFrom,
      to: innerTo,
      insert: `${wrap}${inner}${wrap}`,
      anchor: innerFrom + size,
      head: innerTo + size,
    };
  }

  if (action === "link") {
    const insert = `[${inner}](${LINK_URL})`;
    // With a text selected the address is what is left to type; without
    // one, the text is.
    const urlStart = innerFrom + inner.length + 3;
    return inner
      ? {
          from: innerFrom,
          to: innerTo,
          insert,
          anchor: urlStart,
          head: urlStart + LINK_URL.length,
        }
      : {
          from: innerFrom,
          to: innerTo,
          insert,
          anchor: innerFrom + 1,
          head: innerFrom + 1,
        };
  }

  // A selection that ends with a line break ends on the line before it.
  const lineTo = to > from && text[to - 1] === "\n" ? to - 1 : to;
  // At the very start there is no line break to look back for, and
  // `lastIndexOf` reads a negative index as 0: a text that begins with a
  // break would then start its first line after its end.
  const start = from === 0 ? 0 : text.lastIndexOf("\n", from - 1) + 1;
  const nextBreak = text.indexOf("\n", lineTo);
  const end = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(start, end).split("\n");
  const isMarked = lines.every(
    (line, index) =>
      line.startsWith(linePrefix(action, index)) ||
      (action === "heading" && /^#{1,6} /.test(line)),
  );
  const insert = lines
    .map((line, index) => {
      const bare = line.replace(LINE_MARK, "");
      return isMarked ? bare : `${linePrefix(action, index)}${bare}`;
    })
    .join("\n");

  return {
    from: start,
    to: end,
    insert,
    anchor: start + insert.length,
    head: start + insert.length,
  };
};
