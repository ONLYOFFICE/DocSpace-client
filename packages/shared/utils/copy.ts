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

import copy from "copy-to-clipboard";
import { TViewAs } from "../types";

import { TRoom } from "../api/rooms/types";
import { TFile, TFolder } from "../api/files/types";
import { TGroup } from "../api/groups/types";
import { TPeopleListItem } from "../api/people/types";

export type TSelection = TRoom | TFile | TFolder | TPeopleListItem | TGroup;

export const copyShareLink = async (link: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error(err);
    }
  } else {
    copy(link);
  }
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
    textToCopy += item.title;
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
