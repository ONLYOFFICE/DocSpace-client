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

import copy from "copy-to-clipboard";
import { TViewAs } from "../types";

import { TRoom } from "../api/rooms/types";
import { TFile, TFolder } from "../api/files/types";
import { TGroup } from "../api/groups/types";
import { TPeopleListItem } from "../api/people/types";

export type TSelection = TRoom | TFile | TFolder | TPeopleListItem | TGroup;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const copyShareLink = async (link: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(link);
      return;
    } catch (err) {
      console.error(err);
    }
  }
  await wait(100);
  copy(link);
};

const copyRowSelectedText = (e: KeyboardEvent) => {
  const container = document.querySelector(
    ".ReactVirtualized__Grid__innerScrollContainer",
  );
  if (!container) return e;

  const checkedElements = container.querySelectorAll(".checked");

  if (!checkedElements.length) return e;

  let textToCopy = "";

  checkedElements.forEach((el) => {
    // Split the input string into lines and trim whitespace
    if (el instanceof HTMLElement) {
      textToCopy += el.innerText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join(" ");
    }
    // Insert a line break
    textToCopy += "\n";
  });

  copy(textToCopy);
};

const copyTileSelectedText = (selection: TSelection[]) => {
  let textToCopy = "";
  selection.forEach((item) => {
    const title =
      "title" in item
        ? item.title
        : "userName" in item
          ? item.userName
          : item.name;
    textToCopy += title;
    textToCopy += "\n";
  });

  copy(textToCopy);
};

export const copySelectedText = (
  e: KeyboardEvent,
  viewAs: TViewAs,
  selection: TSelection[],
) => {
  switch (viewAs) {
    case "table":
    case "row":
      return copyRowSelectedText(e);

    case "tile":
      return copyTileSelectedText(selection);
    default:
      return e;
  }
};

export const clearTextSelection = () => {
  if (typeof window === "undefined") return;

  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  }
};

export const handleCopy = (e: ClipboardEvent) => {
  if (!e.clipboardData) return;

  const selection = window.getSelection();
  if (!selection || selection.toString().length === 0) return;

  e.clipboardData.setData("text/plain", selection.toString());
  e.preventDefault();
};
