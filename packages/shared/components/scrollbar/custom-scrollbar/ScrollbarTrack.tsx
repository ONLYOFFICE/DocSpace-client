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

import { cnb } from "cnbuilder";
import React from "react";
import { AxisDirection, ElementPropsWithElementRefAndRenderer } from "./types";
import { isFun, isUndef, renderDivWithRenderer } from "./util";

export interface ScrollbarTrackClickParameters {
  axis: AxisDirection;
  offset: number;
}

export type ScrollbarTrackProps = ElementPropsWithElementRefAndRenderer & {
  axis: AxisDirection;

  onClick?: (ev: MouseEvent, values: ScrollbarTrackClickParameters) => void;

  ref?: (ref: ScrollbarTrack | null) => void;
};

class ScrollbarTrack extends React.Component<ScrollbarTrackProps, unknown> {
  public element: HTMLDivElement | null = null;

  public componentDidMount(): void {
    if (!this.element) {
      this.setState(() => {
        // throw new Error(
        //   "Element was not created. Possibly you haven't provided HTMLDivElement to renderer's `elementRef` function.",
        // );
      });
      return;
    }

    this.element?.addEventListener("click", this.handleClick);
  }

  public componentWillUnmount(): void {
    if (this.element) {
      this.element.removeEventListener("click", this.handleClick);
      this.element = null;

      this.elementRef(null);
    }
  }

  private elementRef = (ref: HTMLDivElement | null): void => {
    if (!ref && this.element) return;
    if (isFun(this.props.elementRef)) this.props.elementRef(ref);
    this.element = ref;
  };

  private handleClick = (ev: MouseEvent) => {
    if (!ev || !this.element || ev.button !== 0) {
      return;
    }

    if (isFun(this.props.onClick) && ev.target === this.element) {
      if (!isUndef(ev.offsetX)) {
        this.props.onClick(ev, {
          axis: this.props.axis,
          offset: this.props.axis === AxisDirection.X ? ev.offsetX : ev.offsetY,
        });
      } else {
        // support for old browsers
        /* istanbul ignore next */
        const rect: ClientRect = this.element.getBoundingClientRect();
        /* istanbul ignore next */
        this.props.onClick(ev, {
          axis: this.props.axis,
          offset:
            this.props.axis === AxisDirection.X
              ? (ev.clientX ||
                  (ev as unknown as TouchEvent).touches[0].clientX) - rect.left
              : (ev.clientY ||
                  (ev as unknown as TouchEvent).touches[0].clientY) - rect.top,
        });
      }
    }

    return true;
  };

  public render(): React.ReactElement<unknown> | null {
    const {
      // biome-ignore lint/correctness/noUnusedVariables: used in destructuring to exclude from props
      elementRef,

      axis,
      // biome-ignore lint/correctness/noUnusedVariables: used in destructuring to exclude from props
      onClick,

      ...props
    } = this.props as ScrollbarTrackProps;

    props.className = cnb(
      "ScrollbarsCustom-Track",
      axis === AxisDirection.X
        ? "ScrollbarsCustom-TrackX"
        : "ScrollbarsCustom-TrackY",
      props.className,
    );

    if (props.renderer) {
      (props as ScrollbarTrackProps).axis = axis;
    }

    return renderDivWithRenderer(props, this.elementRef);
  }
}

export default ScrollbarTrack;
