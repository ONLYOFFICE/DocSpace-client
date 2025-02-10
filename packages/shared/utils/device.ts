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

export const INFO_PANEL_WIDTH = 400;
export const MAX_INFINITE_LOADER_SHIFT = 800;

export function checkIsSSR() {
  return typeof window === "undefined";
}

export const size = {
  mobile: 600,
  // table: is between
  desktop: 1024,
};

export const mobile = `(max-width: ${size.mobile}px)`;

export const mobileMore = `(min-width: ${size.mobile}px)`;

export const tablet = `(max-width: ${size.desktop - 0.1}px)`;

export const desktop = `(min-width: ${size.desktop}px)`;

export const transitionalScreenSize = `(max-width: ${
  size.desktop + INFO_PANEL_WIDTH
}px)`;

export const isMobile = (width?: number) => {
  return (
    (width ?? ((typeof window !== "undefined" && window.innerWidth) || 0)) <=
    size.mobile
  );
};

export const isMobileDevice = () => {
  const angleByRadians =
    (Math.PI / 180) *
    (window.screen?.orientation?.angle ?? window.orientation ?? 0);
  const width = Math.abs(
    Math.round(
      Math.sin(angleByRadians) * window.innerHeight +
        Math.cos(angleByRadians) * window.innerWidth,
    ),
  );
  return isMobile(width);
};

export const isTablet = (width?: number) => {
  const checkWidth =
    width || (typeof window !== "undefined" && window.innerWidth) || 0;
  return checkWidth > size.mobile && checkWidth < size.desktop;
};

export const isDesktop = () => {
  if (!checkIsSSR()) {
    return window.innerWidth >= size.desktop;
  }
  return false;
};

export const isTouchDevice = !!(
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0)
);
