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

const intervalTimeout = 10;

const MAX = 100;
let timerId: ReturnType<typeof setTimeout> | null;
let width = 0;
let percentage = 0;
const increasePercentage = 0.75;
const moreIncreasePercentage = 3;

let elem =
  typeof document !== "undefined" &&
  document.getElementById("ipl-progress-indicator");

const setAttributes = (element: HTMLElement | null) => {
  if (!element) return;
  element.setAttribute("role", "progressbar");
  element.setAttribute("aria-valuemin", "0");
  element.setAttribute("aria-valuemax", "100");
  element.setAttribute("data-test-id", "top-loader");
};

const cancelProgress = () => {
  if (timerId) clearTimeout(timerId);
  timerId = null;
  if (elem) {
    elem.style.width = "0px";
    elem.setAttribute("aria-valuenow", "0");
  }
  width = 0;
};

const animatingWidth = () => {
  if (width >= MAX) {
    cancelProgress();
    return;
  }

  width += percentage !== MAX ? increasePercentage : moreIncreasePercentage;
  if (elem) {
    elem.style.width = `${width}%`;
    elem.setAttribute("aria-valuenow", width.toString());
  }
};

const startInterval = () => {
  if (timerId) return;

  if (!elem) {
    elem = document.getElementById("ipl-progress-indicator");
    setAttributes(elem);
  }

  timerId = setInterval(animatingWidth, intervalTimeout);
};

export default class TopLoaderService {
  static start() {
    percentage = 0;

    if (elem) elem.setAttribute("aria-valuenow", "0");

    startInterval();
  }

  static cancel() {
    cancelProgress();
  }

  static end() {
    percentage = MAX;

    if (elem) elem.setAttribute("aria-valuenow", "100");
  }
}
