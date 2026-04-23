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

export const CUSTOM_STYLES_LINK_ID = "sdk-custom-styles";

export const sanitizeStylesUrl = (
  url: string | null | undefined,
): string => {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
};

export const applyCustomStyles = (url: string | null | undefined): void => {
  if (typeof document === "undefined") return;

  const sanitized = sanitizeStylesUrl(url);
  const existing = document.getElementById(
    CUSTOM_STYLES_LINK_ID,
  ) as HTMLLinkElement | null;

  if (!sanitized) {
    existing?.remove();
    return;
  }

  if (existing) {
    if (existing.href !== sanitized) existing.href = sanitized;
    return;
  }

  const link = document.createElement("link");
  link.id = CUSTOM_STYLES_LINK_ID;
  link.rel = "stylesheet";
  link.href = sanitized;
  link.referrerPolicy = "no-referrer";
  document.head.appendChild(link);
};
