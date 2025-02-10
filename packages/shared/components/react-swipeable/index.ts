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

/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";

import {
  AttachTouch,
  SwipeDirections,
  DOWN,
  SwipeEventData,
  HandledEvents,
  LEFT,
  RIGHT,
  Setter,
  ConfigurationOptions,
  SwipeableDirectionCallbacks,
  SwipeablePropsWithDefaultOptions,
  SwipeableState,
  UP,
  Vector2,
  // Tuple,
  Point,
} from "./types";

const defaultProps: ConfigurationOptions = {
  delta: 10,
  preventScrollOnSwipe: false,
  rotationAngle: 0,
  trackMouse: false,
  trackTouch: true,
  swipeDuration: Infinity,
  touchEventOptions: { passive: true },
};
const initialState: SwipeableState = {
  first: true,
  initial: [0, 0],
  start: 0,
  swiping: false,
  xy: [0, 0],
  lastDistance: 0,
  pinching: false,
  fingers: 0,
  lastTouchStart: 0,
  isDoubleTap: false,
  startTouches: [],
  interaction: null,
};
const mouseMove = "mousemove";
const mouseUp = "mouseup";
const touchEnd = "touchend";
const touchMove = "touchmove";
const touchStart = "touchstart";

function getDirection(
  absX: number,
  absY: number,
  deltaX: number,
  deltaY: number,
): SwipeDirections {
  if (absX > absY) {
    if (deltaX > 0) {
      return RIGHT;
    }
    return LEFT;
  }
  if (deltaY > 0) {
    return DOWN;
  }
  return UP;
}

function getDistance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// function getXYfromEvent(event: TouchEvent): Tuple<Point> {
//   return [...event.touches].map((touch) => ({
//     x: touch.pageX,
//     y: touch.pageY,
//   })) as Tuple<Point>;
// }

function getMiddleSegment(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

const getPointByPageCoordinates = (touch: Touch): Point => ({
  x: touch.pageX,
  y: touch.pageY,
});

function rotateXYByAngle(pos: Vector2, angle: number): Vector2 {
  if (angle === 0) return pos;
  const angleInRadians = (Math.PI / 180) * angle;
  const x =
    pos[0] * Math.cos(angleInRadians) + pos[1] * Math.sin(angleInRadians);
  const y =
    pos[1] * Math.cos(angleInRadians) - pos[0] * Math.sin(angleInRadians);
  return [x, y];
}

function getHandlers(
  set: Setter,
  handlerProps: { trackMouse: boolean | undefined },
): [
  {
    ref: (element: HTMLElement | null) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
  },
  AttachTouch,
] {
  const onStart = (event: HandledEvents) => {
    const isTouch = "touches" in event;
    event.stopPropagation();

    if (!isTouch) return;

    set((state, props) => {
      // setup mouse listeners on document to track swipe since swipe can leave container
      // if (props.trackMouse && !isTouch) {
      //   document.addEventListener(mouseMove, onMove);
      //   document.addEventListener(mouseUp, onUp);
      // }
      const stateLet = state;

      const { clientX, clientY } = isTouch ? event.touches[0] : event;
      const xy = rotateXYByAngle([clientX, clientY], props.rotationAngle);

      props.onTouchStartOrOnMouseDown?.({ event });

      const time = new Date().getTime();

      if (event.touches.length > 1) {
        stateLet.lastTouchStart = 0;
      }

      if (time - state.lastTouchStart < 300) {
        stateLet.isDoubleTap = true;
        props.onDoubleTap?.(event);
        // console.log("Double Click");
      } else {
        stateLet.isDoubleTap = false;
      }

      if (event.touches.length === 1) {
        stateLet.lastTouchStart = time;
      }

      return {
        ...stateLet,
        ...initialState,
        lastTouchStart: state.lastTouchStart,
        initial: xy.slice() as Vector2,
        xy,
        start: event.timeStamp || 0,
        fingers: isTouch ? event.touches.length : 0,
        isDoubleTap: stateLet.isDoubleTap,
      };
    });
  };

  const onMove = (event: HandledEvents) => {
    set((state, props) => {
      const stateLet = state;

      const isTouch = "touches" in event;

      if (stateLet.isDoubleTap || !isTouch) {
        return stateLet;
      }

      if (stateLet.first) {
        stateLet.startTouches = [...event.touches].map((touch) =>
          getPointByPageCoordinates(touch),
        );

        const fingers = event.touches.length;

        if (fingers === 2) {
          stateLet.interaction = "zoom";
        } else if (fingers === 1) {
          stateLet.interaction = "drag";
        } else {
          stateLet.interaction = null;
        }
      }

      // Discount a swipe if additional touches are present after
      // a swipe has started.
      if (isTouch && event.touches.length > 1) {
        if (event.touches.length === 2) {
          const touchFist = event.touches[0];
          const touchSecond = event.touches[1];

          // const move = getXYfromEvent(event);

          const middleSegment = getMiddleSegment(
            { x: touchFist.clientX, y: touchFist.clientY },
            { x: touchSecond.clientX, y: touchSecond.clientY },
          );
          const distance = getDistance(
            { x: touchFist.clientX, y: touchFist.clientY },
            { x: touchSecond.clientX, y: touchSecond.clientY },
          );

          if (stateLet.lastDistance === 0) {
            stateLet.lastDistance = distance;
          }

          const scale = distance / stateLet.lastDistance;
          // console.log("move", move);

          props.onZoom?.({ event, scale, middleSegment });
          return {
            ...stateLet,
            first: false,
            lastDistance: distance,
          };
        }

        return stateLet;
      }

      // if swipe has exceeded duration stop tracking
      if (event.timeStamp - state.start > props.swipeDuration) {
        return state.swiping ? { ...state, swiping: false } : state;
      }

      const { clientX, clientY } = isTouch ? event.touches[0] : event;
      const [x, y] = rotateXYByAngle([clientX, clientY], props.rotationAngle);
      const deltaX = x - state.xy[0];
      const deltaY = y - state.xy[1];
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const time = (event.timeStamp || 0) - state.start;
      const velocity = Math.sqrt(absX * absX + absY * absY) / (time || 1);
      const vxvy: Vector2 = [deltaX / (time || 1), deltaY / (time || 1)];

      const dir = getDirection(absX, absY, deltaX, deltaY);

      // if swipe is under delta and we have not started to track a swipe: skip update
      const delta =
        typeof props.delta === "number"
          ? props.delta
          : props.delta[dir.toLowerCase() as Lowercase<SwipeDirections>] ||
            defaultProps.delta;
      if (
        typeof delta === "number" &&
        absX < delta &&
        absY < delta &&
        !state.swiping
      )
        return state;

      const eventData = {
        absX,
        absY,
        deltaX,
        deltaY,
        dir,
        event,
        first: state.first,
        initial: state.initial,
        velocity,
        vxvy,
        piching: state.pinching,
      };

      // call onSwipeStart if present and is first swipe event
      if (eventData.first) props.onSwipeStart?.(eventData);

      // call onSwiping if present
      props.onSwiping?.(eventData);

      // track if a swipe is cancelable (handler for swiping or swiped(dir) exists)
      // so we can call preventDefault if needed
      let cancelablePageSwipe = false;
      if (
        props.onSwiping ||
        props.onSwiped ||
        props[`onSwiped${dir}` as keyof SwipeableDirectionCallbacks]
      ) {
        cancelablePageSwipe = true;
      }

      if (
        cancelablePageSwipe &&
        props.preventScrollOnSwipe &&
        props.trackTouch &&
        event.cancelable
      ) {
        event.preventDefault();
      }

      return {
        ...state,
        // first is now always false
        first: false,
        eventData,
        swiping: true,
      };
    });
  };

  const onEnd = (event: HandledEvents) => {
    set((state, props) => {
      let eventData: SwipeEventData | undefined;
      if (state.swiping && state.eventData) {
        // if swipe is less than duration fire swiped callbacks
        if (event.timeStamp - state.start < props.swipeDuration) {
          eventData = { ...state.eventData, event };
          props.onSwiped?.(eventData);

          const onSwipedDir =
            props[
              `onSwiped${eventData.dir}` as keyof SwipeableDirectionCallbacks
            ];
          onSwipedDir?.(eventData);
        }
      } else {
        props.onTap?.({ event });
      }

      props.onTouchEndOrOnMouseUp?.({ event });

      return {
        ...state,
        ...initialState,
        eventData,
        lastTouchStart: state.lastTouchStart,
      };
    });
  };

  const onUp = (e: HandledEvents) => {
    cleanUpMouse();
    onEnd(e);
  };

  const cleanUpMouse = () => {
    // safe to just call removeEventListener
    document.removeEventListener(mouseMove, onMove);
    document.removeEventListener(mouseUp, onUp);
  };

  /**
   * The value of passive on touchMove depends on `preventScrollOnSwipe`:
   * - true => { passive: false }
   * - false => { passive: true } // Default
   *
   * NOTE: When preventScrollOnSwipe is true, we attempt to call preventDefault to prevent scroll.
   *
   * props.touchEventOptions can also be set for all touch event listeners,
   * but for `touchmove` specifically when `preventScrollOnSwipe` it will
   * supersede and force passive to false.
   *
   */
  const attachTouch: AttachTouch = (el, props) => {
    let cleanup = () => {};
    if (el && el.addEventListener) {
      const baseOptions = {
        ...defaultProps.touchEventOptions,
        ...props.touchEventOptions,
      };
      // attach touch event listeners and handlers
      const tls: [
        typeof touchStart | typeof touchMove | typeof touchEnd,
        (e: HandledEvents) => void,
        { passive: boolean },
      ][] = [
        [touchStart, onStart, baseOptions],
        // preventScrollOnSwipe option supersedes touchEventOptions.passive
        [
          touchMove,
          onMove,
          {
            ...baseOptions,
            ...(props.preventScrollOnSwipe ? { passive: false } : {}),
          },
        ],
        [touchEnd, onEnd, baseOptions],
      ];
      tls.forEach(([e, h, o]) => el.addEventListener(e, h, o));
      // return properly scoped cleanup method for removing listeners, options not required
      cleanup = () => tls.forEach(([e, h]) => el.removeEventListener(e, h));
    }
    return cleanup;
  };

  const onRef = (el: HTMLElement | null) => {
    // "inline" ref functions are called twice on render, once with null then again with DOM element
    // ignore null here
    if (el === null) return;
    set((state, props) => {
      // if the same DOM el as previous just return state
      if (state.el === el) return state;

      const addState: { cleanUpTouch?: () => void } = {};
      // if new DOM el clean up old DOM and reset cleanUpTouch
      if (state.el && state.el !== el && state.cleanUpTouch) {
        state.cleanUpTouch();
        addState.cleanUpTouch = undefined;
      }
      // only attach if we want to track touch
      if (props.trackTouch && el) {
        addState.cleanUpTouch = attachTouch(el, props);
      }

      // store event attached DOM el for comparison, clean up, and re-attachment
      return { ...state, el, ...addState };
    });
  };

  // set ref callback to attach touch event listeners
  const output: { ref: typeof onRef; onMouseDown?: typeof onStart } = {
    ref: onRef,
  };

  // if track mouse attach mouse down listener
  if (handlerProps.trackMouse) {
    output.onMouseDown = onStart;
  }

  return [output, attachTouch];
}

function updateTransientState(
  state: SwipeableState,
  props: SwipeablePropsWithDefaultOptions,
  previousProps: SwipeablePropsWithDefaultOptions,
  attachTouch: AttachTouch,
) {
  // if trackTouch is off or there is no el, then remove handlers if necessary and exit
  if (!props.trackTouch || !state.el) {
    if (state.cleanUpTouch) {
      state.cleanUpTouch();
    }

    return {
      ...state,
      cleanUpTouch: undefined,
    };
  }

  // trackTouch is on, so if there are no handlers attached, attach them and exit
  if (!state.cleanUpTouch) {
    return {
      ...state,
      cleanUpTouch: attachTouch(state.el, props),
    };
  }

  // trackTouch is on and handlers are already attached, so if preventScrollOnSwipe changes value,
  // remove and reattach handlers (this is required to update the passive option when attaching
  // the handlers)
  if (
    props.preventScrollOnSwipe !== previousProps.preventScrollOnSwipe ||
    props.touchEventOptions.passive !== previousProps.touchEventOptions.passive
  ) {
    state.cleanUpTouch();

    return {
      ...state,
      cleanUpTouch: attachTouch(state.el, props),
    };
  }

  return state;
}

export function useSwipeable(options: { trackMouse: boolean }) {
  const { trackMouse } = options;
  const transientState = React.useRef({ ...initialState });
  const transientProps = React.useRef<SwipeablePropsWithDefaultOptions>({
    ...defaultProps,
  });

  // track previous rendered props
  const previousProps = React.useRef<SwipeablePropsWithDefaultOptions>({
    ...transientProps.current,
  });
  previousProps.current = { ...transientProps.current };

  // update current render props & defaults
  transientProps.current = {
    ...defaultProps,
    ...options,
  };
  // Force defaults for config properties

  Object.keys(defaultProps).forEach((defaultKey) => {
    if (
      defaultKey in transientProps.current &&
      // @ts-expect-error its good
      transientProps.current[defaultKey] === undefined
    ) {
      // @ts-expect-error its good
      transientProps.current[defaultKey] = defaultProps[defaultKey];
    }
  });

  const [handlers, attachTouch] = React.useMemo(
    () =>
      getHandlers(
        (stateSetter) =>
          (transientState.current = stateSetter(
            transientState.current,
            transientProps.current,
          )),
        { trackMouse },
      ),
    [trackMouse],
  );

  transientState.current = updateTransientState(
    transientState.current,
    transientProps.current,
    previousProps.current,
    attachTouch,
  );

  return handlers;
}
