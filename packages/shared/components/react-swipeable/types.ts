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

import * as React from "react";

export const LEFT = "Left";
export const RIGHT = "Right";
export const UP = "Up";
export const DOWN = "Down";
export type HandledEvents = React.MouseEvent | TouchEvent | MouseEvent;
export type Vector2 = [number, number];
export type Tuple<T> = [T, T];
export type Point = { x: number; y: number };
export type ZoomEvent = {
  event: TouchEvent;
  scale: number;
  middleSegment: Point;
};

export type SwipeDirections =
  | typeof LEFT
  | typeof RIGHT
  | typeof UP
  | typeof DOWN;
export interface SwipeEventData {
  /**
   * Absolute displacement of swipe in x. Math.abs(deltaX);
   */
  absX: number;
  /**
   * Absolute displacement of swipe in y. Math.abs(deltaY);
   */
  absY: number;
  /**
   * Displacement of swipe in x. (current.x - initial.x)
   */
  deltaX: number;
  /**
   * Displacement of swipe in y. (current.y - initial.y)
   */
  deltaY: number;
  /**
   * Direction of swipe - Left | Right | Up | Down
   */
  dir: SwipeDirections;
  /**
   * Source event.
   */
  event: HandledEvents;
  /**
   * True for the first event of a tracked swipe.
   */
  first: boolean;
  /**
   * Location where swipe started - [x, y].
   */
  initial: Vector2;
  /**
   * "Absolute velocity" (speed) - sqr(absX^2 + absY^2) / time
   */
  velocity: number;
  /**
   * Velocity per axis - [ deltaX/time, deltaY/time ]
   */
  vxvy: Vector2;

  piching: boolean;
}

export type SwipeCallback = (eventData: SwipeEventData) => void;
export type TapCallback = ({ event }: { event: HandledEvents }) => void;
export type ZoomCallback = (event: ZoomEvent) => void;

export type SwipeableDirectionCallbacks = {
  /**
   * Called after a DOWN swipe
   */
  onSwipedDown: SwipeCallback;
  /**
   * Called after a LEFT swipe
   */
  onSwipedLeft: SwipeCallback;
  /**
   * Called after a RIGHT swipe
   */
  onSwipedRight: SwipeCallback;
  /**
   * Called after a UP swipe
   */
  onSwipedUp: SwipeCallback;
};

export type SwipeableCallbacks = SwipeableDirectionCallbacks & {
  /**
   * Called at start of a tracked swipe.
   */
  onSwipeStart: SwipeCallback;
  /**
   * Called after any swipe.
   */
  onSwiped: SwipeCallback;
  /**
   * Called for each move event during a tracked swipe.
   */
  onSwiping: SwipeCallback;
  /**
   * Called after a tap. A touch under the min distance, `delta`.
   */
  onTap: TapCallback;

  /**
   * Called for `touchstart` and `mousedown`.
   */
  onTouchStartOrOnMouseDown: TapCallback;
  /**
   * Called for `touchend` and `mouseup`.
   */
  onTouchEndOrOnMouseUp: TapCallback;

  onZoom: ZoomCallback;
  onDoubleTap: (event: TouchEvent) => void;
};

// Configuration Options
export type ConfigurationOptionDelta =
  | number
  | { [key in Lowercase<SwipeDirections>]?: number };

export interface ConfigurationOptions {
  /**
   * Min distance(px) before a swipe starts. **Default**: `10`
   */
  delta: ConfigurationOptionDelta;
  /**
   * Prevents scroll during swipe in most cases. **Default**: `false`
   */
  preventScrollOnSwipe: boolean;
  /**
   * Set a rotation angle. **Default**: `0`
   */
  rotationAngle: number;
  /**
   * Track mouse input. **Default**: `false`
   */
  trackMouse: boolean;
  /**
   * Track touch input. **Default**: `true`
   */
  trackTouch: boolean;
  /**
   * Allowable duration of a swipe (ms). **Default**: `Infinity`
   */
  swipeDuration: number;
  /**
   * Options for touch event listeners
   */
  touchEventOptions: { passive: boolean };
}

export type SwipeableProps = Partial<SwipeableCallbacks & ConfigurationOptions>;

export type SwipeablePropsWithDefaultOptions = Partial<SwipeableCallbacks> &
  ConfigurationOptions;

export interface SwipeableHandlers {
  ref(element: HTMLElement | null): void;
  onMouseDown?(event: React.MouseEvent): void;
}

export type SwipeableState = {
  cleanUpTouch?: () => void;
  el?: HTMLElement;
  eventData?: SwipeEventData;
  first: boolean;
  initial: Vector2;
  start: number;
  swiping: boolean;
  xy: Vector2;
  startPosition?: Tuple<Point>;
  lastDistance: number;
  pinching: boolean;
  fingers: number;
  lastTouchStart: number;
  isDoubleTap: boolean;
  startTouches: Point[];
  interaction: "zoom" | "drag" | null;
};

export type StateSetter = (
  state: SwipeableState,
  props: SwipeablePropsWithDefaultOptions,
) => SwipeableState;
export type Setter = (stateSetter: StateSetter) => void;
export type AttachTouch = (
  el: HTMLElement,
  props: SwipeablePropsWithDefaultOptions,
) => () => void;
