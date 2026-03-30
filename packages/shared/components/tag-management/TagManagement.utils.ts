// (c) Copyright Ascensio System SIA 2009-2026
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
import unionBy from "lodash/unionBy";
import isString from "lodash/isString";

import type { TagType } from "@docspace/ui-kit/components/tag";

import type { TTag } from "./TagManagement.types";

export function transformTagsData(
  roomTags: Array<TagType | string | TTag>,
  checked: boolean = false,
): TTag[] {
  return roomTags.map((tag) => ({
    label: isString(tag) ? tag : tag.label,
    checked,
  }));
}

export function unionTagsData(
  roomTags: Array<TagType | string>,
  data: string[] | undefined,
): TTag[] {
  const temp: TTag[] = transformTagsData(
    roomTags.filter(
      (tag) => isString(tag) || !("isDefault" in tag) || !tag.isDefault,
    ),
    true,
  );

  if (!data) return temp;

  return unionBy(temp, transformTagsData(data, false), "label");
}

function fuzzyMatch(text: string, query: string) {
  text = text.toLowerCase();
  query = query.toLowerCase();
  let ti = 0,
    qi = 0;

  while (ti < text.length && qi < query.length) {
    if (text[ti] === query[qi]) qi++;
    ti++;
  }

  return qi === query.length;
}

export function searchFilter(list: TTag[], query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return list;

  return list
    .map((item) => {
      const text = item.label.trim().toLowerCase();
      let score = 0;

      if (text === q) score = 200;
      else if (text.startsWith(q)) score = 150;
      else if (text.includes(q)) score = 100 - text.indexOf(q);
      else if (fuzzyMatch(text, q)) score = 50;

      return { item, score };
    })
    .filter((obj) => obj.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((obj) => obj.item);
}

export const stopPropagation = (event: React.MouseEvent) =>
  event.stopPropagation();

export const promiseWithResolvers = <T>() => {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};
