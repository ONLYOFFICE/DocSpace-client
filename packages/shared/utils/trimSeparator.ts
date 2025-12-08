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

import { ContextMenuModel } from "../components/context-menu/ContextMenu.types";

const DESTRUCTIVE_ACTIONS = [
  "delete",
  "remove-from-recent",
  "remove-shared-folder-or-file",
  "remove-shared-room",
  "unsubscribe",
];

export function trimSeparator(array: ContextMenuModel[]) {
  if (!array || !Array.isArray(array) || array.length === 0) return array;

  const { length } = array;
  const result: ContextMenuModel[] = [];

  for (let index = 0; index < length; index += 1) {
    const el = array[index];

    if (el?.isSeparator && result.length > 0) {
      if (!result[result.length - 1]?.isSeparator) result.push(el);
    } else if (!el?.isSeparator && !el?.disabled) {
      result.push(el);
    }
  }

  // If there are few elements, remove all separators and leave only between the destructive group

  const nonSeparatorItems = result.filter((item) => !item?.isSeparator);

  if (nonSeparatorItems.length < 6) {
    const filteredResult: ContextMenuModel[] = [];

    for (let i = 0; i < result.length; i++) {
      const item = result[i];

      if (item?.isSeparator) {
        const nextItem = result[i + 1];
        if (
          nextItem &&
          DESTRUCTIVE_ACTIONS.includes(nextItem.key?.toString() || "")
        ) {
          filteredResult.push(item);
        }
      } else {
        filteredResult.push(item);
      }
    }

    if (filteredResult[filteredResult.length - 1]?.isSeparator) {
      filteredResult.pop();
    }

    return filteredResult;
  }

  if (result[result.length - 1]?.isSeparator) result.pop();

  return result;
}
