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

export default class DomHelpers {
  static calculatedScrollbarWidth: number | null = null;

  static zIndex: number;

  static getViewport() {
    if (typeof window !== "undefined") {
      const win = window;
      const d = document;
      const e = d.documentElement;
      const g = d.getElementsByTagName("body")[0];
      const w = win.innerWidth || e.clientWidth || g.clientWidth;
      const h = win.innerHeight || e.clientHeight || g.clientHeight;

      return { width: w, height: h };
    }
    return { width: 0, height: 0 };
  }

  static getOffset(el?: HTMLElement | null) {
    if (el) {
      const rect = el.getBoundingClientRect();

      return {
        top:
          rect.top +
          (window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0),
        left:
          rect.left +
          (window.pageXOffset ||
            document.documentElement.scrollLeft ||
            document.body.scrollLeft ||
            0),
      };
    }

    return {
      top: "auto",
      left: "auto",
    };
  }

  static getOuterWidth(el: HTMLElement, margin?: string) {
    if (el) {
      let width = el.offsetWidth;

      if (margin) {
        const style = getComputedStyle(el);
        width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      }

      return width;
    }
    return 0;
  }

  static getHiddenElementOuterWidth(elementParam: HTMLElement | null) {
    const element = elementParam;

    if (element) {
      const prevVisibility = element.style.visibility;
      const prevDisplay = element.style.display;

      element.style.visibility = "hidden";
      element.style.display = "block";

      const elementWidth = element.offsetWidth;

      element.style.display = prevDisplay;
      element.style.visibility = prevVisibility;

      return elementWidth;
    }
    return 0;
  }

  static getHiddenElementOuterHeight(elementParam: HTMLElement | null) {
    const element = elementParam;
    if (element) {
      const prevVisibility = element.style.visibility;
      const prevDisplay = element.style.display;

      element.style.visibility = "hidden";
      element.style.display = "block";

      const elementHeight = element.offsetHeight;

      element.style.display = prevDisplay;
      element.style.visibility = prevVisibility;

      return elementHeight;
    }
    return 0;
  }

  static calculateScrollbarWidth(el?: HTMLElement) {
    if (el) {
      const style = getComputedStyle(el);
      return (
        el.offsetWidth -
        el.clientWidth -
        parseFloat(style.borderLeftWidth) -
        parseFloat(style.borderRightWidth)
      );
    }
    if (this.calculatedScrollbarWidth != null)
      return this.calculatedScrollbarWidth;

    const scrollDiv = document.createElement("div");
    scrollDiv.className = "p-scrollbar-measure";
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);

    this.calculatedScrollbarWidth = scrollbarWidth;

    return scrollbarWidth;
  }

  static generateZIndex() {
    this.zIndex = this.zIndex || 1000;

    this.zIndex += 1;

    return this.zIndex;
  }

  static revertZIndex() {
    this.zIndex = this.zIndex > 1000 ? this.zIndex - 1 : 1000;
  }

  static getCurrentZIndex() {
    return this.zIndex;
  }
}
