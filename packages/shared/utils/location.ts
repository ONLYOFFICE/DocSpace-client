// (c) Copyright Ascensio System SIA 2009-2024
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
import { PUBLIC_MEDIA_VIEW_URL } from "../constants";

export const isPublicRoom = () => {
  return (
    window.location.pathname === "/rooms/share" ||
    window.location.pathname.includes(PUBLIC_MEDIA_VIEW_URL)
  );
};

export const isPublicPreview = () => {
  return window.location.pathname.includes("/share/preview/");
};

const groupParamsByKey = (params: URLSearchParams) =>
  Array.from(params.entries()).reduce(
    (accumulator: { [key: string]: string | string[] }, [key, value]) => {
      if (accumulator[key]) {
        accumulator[key] = Array.isArray(accumulator[key])
          ? [...accumulator[key], value]
          : [accumulator[key], value];
      } else {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {},
  );

export const parseURL = (searchUrl: string) => {
  const params = new URLSearchParams(searchUrl);
  const entries: { [key: string]: string | string[] } =
    groupParamsByKey(params);
  return entries;
};

export function getObjectByLocation(location: Location) {
  if (!location.search || !location.search.length) return null;

  try {
    const searchUrl = location.search.substring(1);
    const params = parseURL(searchUrl);
    return params;
  } catch (e) {
    console.error(e);
    return {};
  }
}

export const toUrlParams = (
  obj: { [key: string]: unknown },
  skipNull: boolean,
) => {
  let str = "";

  Object.keys(obj).forEach((key) => {
    if (skipNull && !obj[key]) return;

    if (str !== "") {
      str += "&";
    }

    const item = obj[key];

    // added for double employeetype or room type
    if (Array.isArray(item) && (key === "employeetypes" || key === "type")) {
      for (let i = 0; i < item.length; i += 1) {
        str += `${key}=${encodeURIComponent(item[i])}`;
        if (i !== item.length - 1) {
          str += "&";
        }
      }
    } else if (typeof item === "object") {
      str += `${key}=${encodeURIComponent(JSON.stringify(item))}`;
    } else if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      str += `${key}=${encodeURIComponent(item)}`;
    }
  });

  return str;
};

export function tryParse(str: string) {
  try {
    if (!str) return undefined;

    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function tryParseArray(str: string) {
  try {
    const res = tryParse(str);

    if (!Array.isArray(res)) return undefined;

    return res;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
