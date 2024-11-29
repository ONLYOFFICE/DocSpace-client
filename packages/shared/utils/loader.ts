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

import { isMobile } from "react-device-detect";
import TopLoaderService from "../components/top-loading-indicator";

let timer: null | ReturnType<typeof setTimeout> = null;

export function hideLoader() {
  if (isMobile) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  TopLoaderService.end();
}

export function showLoader() {
  if (isMobile) return;

  hideLoader();
  timer = setTimeout(() => TopLoaderService.start(), 500);
}

export function showProgress() {
  if (isMobile) return;
  TopLoaderService.cancel();
  TopLoaderService.start();
}

export function updateTempContent(isAuth = false) {
  if (isAuth) {
    const el = document.getElementById("burger-loader-svg");
    if (el) {
      el.style.display = "block";
    }

    const el1 = document.getElementById("logo-loader-svg");
    if (el1) {
      el1.style.display = "block";
    }

    const el2 = document.getElementById("avatar-loader-svg");
    if (el2) {
      el2.style.display = "block";
    }
  } else {
    const tempElm = document.getElementById("temp-content");
    if (tempElm) {
      tempElm.outerHTML = "";
    }
  }
}
