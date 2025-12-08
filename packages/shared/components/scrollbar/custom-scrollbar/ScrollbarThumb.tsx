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
import { DraggableCore, DraggableData, DraggableEvent } from "react-draggable";
import { AxisDirection, ElementPropsWithElementRefAndRenderer } from "./types";
import { isBrowser, isFun, isUndef, renderDivWithRenderer } from "./util";

export type DragCallbackData = Pick<
  DraggableData,
  Exclude<keyof DraggableData, "node">
>;

export type ScrollbarThumbProps = ElementPropsWithElementRefAndRenderer & {
  axis: AxisDirection;

  onDrag?: (data: DragCallbackData) => void;
  onDragStart?: (data: DragCallbackData) => void;
  onDragEnd?: (data: DragCallbackData) => void;

  ref?: (ref: ScrollbarThumb | null) => void;
};

class ScrollbarThumb extends React.Component<ScrollbarThumbProps, unknown> {
  private static selectStartReplacer = () => false;

  public element: HTMLDivElement | null = null;

  public initialOffsetX = 0;

  public initialOffsetY = 0;

  private prevUserSelect: string = "";

  private prevOnSelectStart: ((ev: Event) => boolean) | null = null;

  private elementRefHack = React.createRef<HTMLElement>();

  public lastDragData: DragCallbackData = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    lastX: 0,
    lastY: 0,
  };

  public componentDidMount(): void {
    if (!this.element) {
      this.setState(() => {
        // throw new Error(
        //   "<ScrollbarThumb> Element was not created. Possibly you haven't provided HTMLDivElement to renderer's `elementRef` function.",
        // );
      });
    }
  }

  public componentWillUnmount(): void {
    this.handleOnDragStop();

    this.elementRef(null);
  }

  public handleOnDragStart = (ev: DraggableEvent, data: DraggableData) => {
    if (!this.element) {
      this.handleOnDragStop(ev, data);
      return;
    }

    if (isBrowser) {
      this.prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      this.prevOnSelectStart = document.onselectstart;
      document.addEventListener(
        "selectstart",
        ScrollbarThumb.selectStartReplacer,
      );
    }

    if (this.props.onDragStart) {
      this.props.onDragStart(
        (this.lastDragData = {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        }),
      );
    }

    this.element.classList.add("dragging");
  };

  public handleOnDrag = (ev: DraggableEvent, data: DraggableData) => {
    if (!this.element) {
      this.handleOnDragStop(ev, data);
      return;
    }

    if (this.props.onDrag) {
      this.props.onDrag(
        (this.lastDragData = {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        }),
      );
    }
  };

  public handleOnDragStop = (ev?: DraggableEvent, data?: DraggableData) => {
    const resultData = data
      ? {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        }
      : this.lastDragData;

    if (this.props.onDragEnd) this.props.onDragEnd(resultData);

    if (this.element) this.element.classList.remove("dragging");

    if (isBrowser) {
      document.body.style.userSelect = this.prevUserSelect;

      if (this.prevOnSelectStart) {
        document.addEventListener("selectstart", this.prevOnSelectStart);
      }

      this.prevOnSelectStart = null;
    }

    this.initialOffsetX = 0;
    this.initialOffsetY = 0;
    this.lastDragData = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      lastX: 0,
      lastY: 0,
    };
  };

  public handleOnMouseDown = (ev: MouseEvent) => {
    if (!this.element) {
      return;
    }

    if (ev.cancelable) {
      ev.preventDefault();
    }
    ev.stopPropagation();

    // @ts-expect-error: get React.MouseEvent instead of MouseEvent here. DraggableCore lib probably has wrong types
    ev.nativeEvent?.stopImmediatePropagation?.();

    if (!isUndef(ev.offsetX)) {
      /* istanbul ignore next */
      this.initialOffsetX = ev.offsetX;
      /* istanbul ignore next */
      this.initialOffsetY = ev.offsetY;
    } else {
      const rect: DOMRect = this.element.getBoundingClientRect();
      this.initialOffsetX =
        (ev.clientX || (ev as unknown as TouchEvent).touches[0].clientX) -
        rect.left;
      this.initialOffsetY =
        (ev.clientY || (ev as unknown as TouchEvent).touches[0].clientY) -
        rect.top;
    }
  };

  private elementRef = (ref: HTMLDivElement | null): void => {
    if (!ref && this.element) return;

    if (isFun(this.props.elementRef)) this.props.elementRef(ref);
    this.element = ref;

    // @ts-ignore
    this.elementRefHack.current = ref;
  };

  // biome-ignore-start lint/correctness/noUnusedVariables: TODO fix
  public render(): React.ReactElement<unknown> | null {
    const { elementRef, axis, onDrag, onDragEnd, onDragStart, ...props } = this
      .props as ScrollbarThumbProps;
    // biome-ignore-end lint/correctness/noUnusedVariables: TODO fix

    props.className = cnb(
      "ScrollbarsCustom-Thumb",
      axis === AxisDirection.X
        ? "ScrollbarsCustom-ThumbX"
        : "ScrollbarsCustom-ThumbY",
      props.className,
    );

    if (props.renderer) {
      (props as ScrollbarThumbProps).axis = axis;
    }

    return (
      <DraggableCore
        allowAnyClick={false}
        enableUserSelectHack={false}
        onMouseDown={this.handleOnMouseDown}
        onDrag={this.handleOnDrag}
        onStart={this.handleOnDragStart}
        onStop={this.handleOnDragStop}
        nodeRef={this.elementRefHack as React.RefObject<HTMLElement>}
      >
        {renderDivWithRenderer(props, this.elementRef)}
      </DraggableCore>
    );
  }
}

export default ScrollbarThumb;
