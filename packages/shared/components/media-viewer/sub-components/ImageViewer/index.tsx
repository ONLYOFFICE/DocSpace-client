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

import { useGesture } from "@use-gesture/react";
import { useSpring, config, animated } from "@react-spring/web";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import classNames from "classnames";
import { checkDialogsOpen } from "../../../../utils/checkDialogsOpen";
import { LOADER_TIMEOUT } from "../../../../constants";

import {
  calculateAdjustBoundsUtils,
  calculateAdjustImageUtil,
  getBounds,
  getImagePositionAndSize,
} from "../../MediaViewer.utils";

import { ViewerLoader } from "../ViewerLoader";
import { ViewerToolbar } from "../ViewerToolbar";
import { KeyboardEventKeys, ToolbarActionType } from "../../MediaViewer.enums";
import type { Point } from "../../MediaViewer.types";

import {
  ImperativeHandle,
  ToolbarItemType,
} from "../ViewerToolbar/ViewerToolbar.props";
import { MessageError } from "../MessageError";

import ImageViewerProps from "./ImageViewer.props";
import styles from "./ImageViewer.module.scss";
import {
  MaxScale,
  MinScale,
  RatioWheel,
  DefaultSpeedScale,
} from "./ImageViewer.constants";

export const ImageViewer = ({
  src,
  onPrev,
  onNext,
  onMask,
  isFistImage,
  isLastImage,
  panelVisible,
  generateContextMenu,
  setIsOpenContextMenu,
  resetToolbarVisibleTimer,
  mobileDetails,
  toolbar,
  thumbnailSrc,
  // imageId,
  // version,
  isDecodedImage,
  contextModel,
  errorTitle,
  devices,
  isPublicFile,
  backgroundBlack,
  setBackgroundBlack,
}: ImageViewerProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unmountRef = useRef<boolean>(false);
  const isLoaded = useRef<boolean>(false);

  const lastTapTimeRef = useRef<number>(0);
  const isDoubleTapRef = useRef<boolean>(false);
  const setTimeoutIDTapRef = useRef<NodeJS.Timeout>(undefined);
  // const changeSourceTimeoutRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const startAngleRef = useRef<number>(0);
  const toolbarRef = useRef<ImperativeHandle>(null);

  const [scale, setScale] = useState(1);
  const [showOriginSrc, setShowOriginSrc] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [style, api] = useSpring(() => ({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
  }));

  const { isMobile, isDesktop } = devices;

  // const changeSource = React.useCallback(
  //   (imageUrl: Blob | MediaSource) => {
  //     if (!window.ClientConfig?.imageThumbnails) return;
  //     changeSourceTimeoutRef.current = setTimeout(() => {
  //       if (imgRef.current && !unmountRef.current) {
  //         if (!src) return;

  //         if (!isTiff) {
  //           imgRef.current.src = URL.createObjectURL(imageUrl);
  //         } else {
  //           imgRef.current.src = src;
  //         }

  //         setIsLoading(() => false);
  //       }
  //     }, 500);
  //   },
  //   [src, isTiff],
  // );

  // const loadImage = React.useCallback(async () => {
  //   if (!src || !window.ClientConfig?.imageThumbnails) return;

  //   try {
  //     const res = await fetch(src);
  //     const blob = await res.blob();

  //     if (isTiff) {
  //       return changeSource(blob);
  //     }

  //     indexedDBHelper.addItem(IndexedDBStores.images, {
  //       id: imageId,
  //       src: blob,
  //       created: new Date(),
  //       version,
  //     });

  //     changeSource(blob);
  //   } catch (error) {
  //     // eslint-disable-next-line no-console
  //     console.log(error);
  //   }
  // }, [src, imageId, version, isTiff, changeSource]);

  const resize = useCallback(() => {
    if (!imgRef.current || isLoading) return;

    const { naturalWidth } = imgRef.current;
    const { naturalHeight } = imgRef.current;

    const imagePositionAndSize = getImagePositionAndSize(
      naturalWidth,
      naturalHeight,
      containerRef.current,
    );
    if (imagePositionAndSize) {
      api.set(imagePositionAndSize);
    }
  }, [api, isLoading]);

  const calculateAdjustImage = (point: Point, diffScale: number = 1) => {
    return calculateAdjustImageUtil(
      imgRef.current,
      containerRef.current,
      point,
      diffScale,
    );
  };

  const imageLoaded = useCallback(
    (event: SyntheticEvent<HTMLImageElement, Event>) => {
      if (!(window.ClientConfig?.imageThumbnails && thumbnailSrc)) {
        setShowOriginSrc(true);
      }

      const { naturalWidth } = event.target as HTMLImageElement;
      const { naturalHeight } = event.target as HTMLImageElement;

      const positionAndSize = getImagePositionAndSize(
        naturalWidth,
        naturalHeight,
        containerRef.current,
      );

      if (!positionAndSize) return;

      api.set({
        ...positionAndSize,
        scale: 1,
        rotate: 0,
      });

      isLoaded.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setIsLoading(false);
      setIsError(false);

      if (isDecodedImage && src) {
        URL.revokeObjectURL(src);
      }
    },
    [api, isDecodedImage, src, thumbnailSrc],
  );

  const restartScaleAndSize = useCallback(() => {
    if (!imgRef.current || style.scale.isAnimating) return;

    const { naturalWidth } = imgRef.current;
    const { naturalHeight } = imgRef.current;

    const imagePositionAndSize = getImagePositionAndSize(
      naturalWidth,
      naturalHeight,
      containerRef.current,
    );

    if (!imagePositionAndSize) return;

    const { x, y, width, height } = imagePositionAndSize;

    const ratio = 1 / style.scale.get();

    const point = calculateAdjustImage({ x, y }, ratio);

    toolbarRef.current?.setPercentValue(1);

    api.start({
      ...point,
      width,
      height,
      scale: 1,
    });
  }, [api, style.scale]);

  const calculateAdjustBounds = useCallback(
    (x: number, y: number, diffScale: number = 1, angle: number = 0) => {
      const bounds = getBounds(
        imgRef.current,
        containerRef.current,
        diffScale,
        angle,
      );
      return calculateAdjustBoundsUtils(x, y, bounds);
    },
    [],
  );

  const rotateImage = useCallback(
    (dir: number) => {
      if (style.rotate.isAnimating) return;

      const rotate = style.rotate.get() + dir * 90;

      const point = calculateAdjustImage(
        calculateAdjustBounds(style.x.get(), style.y.get(), 1, rotate),
      );

      api.start({
        ...point,
        rotate,
        config: {
          // easing: easings.easeInBack,
          duration: 200,
        },
        onResolve(result) {
          api.start({
            ...calculateAdjustImage({
              x: result.value.x,
              y: result.value.y,
            }),
            config: {
              duration: 100,
            },
          });
        },
      });
    },
    [api, calculateAdjustBounds, style.rotate, style.x, style.y],
  );

  const zoomOut = useCallback(() => {
    if (
      style.scale.isAnimating ||
      style.scale.get() <= MinScale ||
      !imgRef.current ||
      !containerRef.current
    )
      return;

    const { width, height, x, y } = imgRef.current.getBoundingClientRect();
    const { width: containerWidth, height: containerHeight } =
      containerRef.current.getBoundingClientRect();

    const scaleCurrent = Math.max(
      style.scale.get() - DefaultSpeedScale,
      MinScale,
    );

    const tx = ((containerWidth - width) / 2 - x) / style.scale.get();
    const ty = ((containerHeight - height) / 2 - y) / style.scale.get();

    const dx = style.x.get() + DefaultSpeedScale * tx;
    const dy = style.y.get() + DefaultSpeedScale * ty;

    const ratio = scaleCurrent / style.scale.get();

    const point = calculateAdjustImage(calculateAdjustBounds(dx, dy, ratio));
    toolbarRef.current?.setPercentValue(scaleCurrent);

    api.start({
      scale: scaleCurrent,
      ...point,
      config: {
        duration: 300,
      },
      onResolve: (result) => {
        api.start({
          ...calculateAdjustImage({
            x: result.value.x,
            y: result.value.y,
          }),
          config: {
            ...config.default,
            duration: 100,
          },
        });
      },
    });
  }, [api, calculateAdjustBounds, style.scale, style.x, style.y]);

  const zoomIn = useCallback(() => {
    if (
      style.scale.isAnimating ||
      style.scale.get() >= MaxScale ||
      !imgRef.current ||
      !containerRef.current
    )
      return;

    const { width, height, x, y } = imgRef.current.getBoundingClientRect();
    const { width: containerWidth, height: containerHeight } =
      containerRef.current.getBoundingClientRect();

    const tx = ((containerWidth - width) / 2 - x) / style.scale.get();
    const ty = ((containerHeight - height) / 2 - y) / style.scale.get();

    const dx = style.x.get() - DefaultSpeedScale * tx;
    const dy = style.y.get() - DefaultSpeedScale * ty;

    const scaleCurrent = Math.min(
      style.scale.get() + DefaultSpeedScale,
      MaxScale,
    );
    toolbarRef.current?.setPercentValue(scaleCurrent);
    api.start({
      x: dx,
      y: dy,
      scale: scaleCurrent,
      config: {
        duration: 300,
      },
    });
  }, [api, style.scale, style.x, style.y]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { code, ctrlKey } = event;

      const someDialogIsOpen = checkDialogsOpen();
      if (someDialogIsOpen) return;

      switch (code) {
        case KeyboardEventKeys.ArrowLeft:
        case KeyboardEventKeys.ArrowRight:
          if (document.fullscreenElement) return;
          if (ctrlKey) {
            const dir = code === KeyboardEventKeys.ArrowRight ? 1 : -1;
            rotateImage(dir);
          }
          break;
        case KeyboardEventKeys.ArrowUp:
        case KeyboardEventKeys.NumpadAdd:
        case KeyboardEventKeys.Equal:
          zoomIn();
          break;
        case KeyboardEventKeys.ArrowDown:
        case KeyboardEventKeys.NumpadSubtract:
        case KeyboardEventKeys.Minus:
          zoomOut();
          break;
        case KeyboardEventKeys.Digit1:
        case KeyboardEventKeys.Numpad1:
          if (ctrlKey) {
            restartScaleAndSize();
          }
          break;
        default:
          break;
      }
    },
    [restartScaleAndSize, rotateImage, zoomIn, zoomOut],
  );

  const zoomOnDoubleTap = (
    event:
      | TouchEvent
      | MouseEvent
      | React.MouseEvent<HTMLImageElement, MouseEvent>,
    scaleArg = 1,
  ) => {
    if (
      !imgRef.current ||
      style.scale.get() >= MaxScale ||
      style.scale.isAnimating
    )
      return;

    const isTouch = "touches" in event;

    const pageX = isTouch ? event.touches[0].pageX : event.pageX;
    const pageY = isTouch ? event.touches[0].pageY : event.pageY;

    const { width, height, x, y } = imgRef.current.getBoundingClientRect();
    const tx = (pageX - (x + width / 2)) / style.scale.get();
    const ty = (pageY - (y + height / 2)) / style.scale.get();

    const dx = style.x.get() - scaleArg * tx;
    const dy = style.y.get() - scaleArg * ty;

    const newScale = Math.min(style.scale.get() + scaleArg, MaxScale);
    const ratio = newScale / style.scale.get();

    const point = calculateAdjustImage(
      calculateAdjustBounds(dx, dy, ratio),
      ratio,
    );

    toolbarRef.current?.setPercentValue(newScale);

    api.start({
      ...point,
      scale: newScale,
      config: config.default,
      // onChange(result) {
      //   api.start(maybeAdjustImage({ x: dx, y: dy }));
      // },
      onResolve() {
        api.start(calculateAdjustImage(calculateAdjustBounds(dx, dy, 1)));
      },
    });
  };

  const handleDoubleTapOrClick = (
    event:
      | TouchEvent
      | MouseEvent
      | React.MouseEvent<HTMLImageElement, MouseEvent>,
  ) => {
    if (style.scale.isAnimating) return;

    if (style.scale.get() !== 1) {
      restartScaleAndSize();
    } else {
      zoomOnDoubleTap(event);
    }
  };

  useGesture(
    {
      onDragStart: ({ pinching }) => {
        if (pinching) return;

        setScale(style.scale.get());
      },
      onDrag: ({
        offset: [dx, dy],
        movement: [mdx, mdy],
        cancel,
        pinching,
        canceled,
      }) => {
        if (!imgRef.current) return;

        if (isDoubleTapRef.current || unmountRef.current) {
          isDoubleTapRef.current = false;
          return;
        }

        if (pinching || canceled) cancel();
        if (!imgRef.current || !containerRef.current) return;

        api.start({
          x:
            style.scale.get() === 1 &&
            !isDesktop &&
            ((isFistImage && mdx > 0) || (isLastImage && mdx < 0))
              ? style.x.get()
              : dx,
          y: dy,
          opacity:
            style.scale.get() === 1 && !isDesktop && mdy > 0 && !isPublicFile
              ? imgRef.current.height / 10 / mdy
              : style.opacity.get(),
          immediate: true,
          config: config.default,
        });
      },

      onDragEnd: ({ cancel, canceled, movement: [mdx, mdy] }) => {
        if (unmountRef.current || !imgRef.current) {
          return;
        }

        if (canceled || isDoubleTapRef.current) {
          isDoubleTapRef.current = false;
          cancel();
        }

        if (style.scale.get() === 1 && !isDesktop && !isPublicFile) {
          if (mdx < -imgRef.current.width / 4) {
            return onNext?.();
          }
          if (mdx > imgRef.current.width / 4) {
            return onPrev?.();
          }
          if (mdy > 150) {
            return onMask?.();
          }
        }

        const newPoint = calculateAdjustImage({
          x: style.x.get(),
          y: style.y.get(),
        });

        api.start({
          ...newPoint,
          opacity: 1,
          config: config.default,
        });
      },

      onPinchStart: ({ event, cancel }) => {
        if (event.target === containerRef.current) {
          cancel();
        } else {
          const roundedAngle = Math.round(style.rotate.get());
          startAngleRef.current = roundedAngle - (roundedAngle % 90);
        }
      },

      onPinch: ({
        origin: [ox, oy],
        offset: [dScale, dRotate],
        lastOffset: [LScale],
        movement: [mScale],
        memo,
        first,
        canceled,
        event,
        pinching,
        cancel,
      }) => {
        if (
          canceled ||
          event.target === containerRef.current ||
          !imgRef.current
        )
          return memo;

        let memoLet = memo;

        if (!pinching) cancel();

        if (first) {
          const { width, height, x, y } =
            imgRef.current.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memoLet = [style.x.get(), style.y.get(), tx, ty];
        }

        const x = memoLet[0] - (mScale - 1) * memoLet[2];
        const y = memoLet[1] - (mScale - 1) * memoLet[3];

        const ratio = dScale / LScale;

        const { x: dx, y: dy } = calculateAdjustImage({ x, y }, ratio);

        const point = calculateAdjustBounds(dx, dy, ratio, dRotate);

        api.start({
          ...point,
          scale: dScale,
          rotate: dRotate,
          delay: 0,
          onChange(result) {
            api.start({
              ...calculateAdjustImage(
                {
                  x: result.value.x,
                  y: result.value.y,
                },
                ratio,
              ),
              delay: 0,
              config: {
                duration: 200,
              },
            });
          },
          config: config.default,
        });
        return memoLet;
      },
      onPinchEnd: ({
        movement: [, mRotate],
        direction: [, dirRotate],
        canceled,
      }) => {
        if (unmountRef.current || canceled) {
          return;
        }
        const rotate =
          Math.abs(mRotate / 90) > 1 / 3
            ? Math.trunc(
                startAngleRef.current +
                  90 *
                    Math.max(Math.trunc(Math.abs(mRotate) / 90), 1) *
                    dirRotate,
              )
            : startAngleRef.current;

        const newPoint = calculateAdjustImage({
          x: style.x.get(),
          y: style.y.get(),
        });

        api.start({
          ...newPoint,
          rotate,
          delay: 0,
          onResolve: () => {
            api.start({
              ...calculateAdjustImage({
                x: style.x.get(),
                y: style.y.get(),
              }),
              delay: 0,
              config: {
                ...config.default,
                duration: 200,
              },
            });
          },
          onChange(result) {
            api.start({
              ...calculateAdjustImage({
                x: result.value.x,
                y: result.value.y,
              }),
              delay: 0,
              config: {
                ...config.default,
                duration: 200,
              },
            });
          },
          config: config.default,
        });
      },

      onClick: ({ pinching, event }) => {
        if (isDesktop && event.target === imgWrapperRef.current)
          return onMask?.();

        if (!imgRef.current || !containerRef.current || pinching || isDesktop)
          return;

        const time = new Date().getTime();

        if (time - lastTapTimeRef.current < 300) {
          // on Double Tap
          lastTapTimeRef.current = 0;
          isDoubleTapRef.current = true;

          handleDoubleTapOrClick(event);

          clearTimeout(setTimeoutIDTapRef.current);
        } else {
          lastTapTimeRef.current = time;
          setTimeoutIDTapRef.current = setTimeout(() => {
            // onTap
            setBackgroundBlack((state) => !state);
          }, 300);
        }
      },
      onWheel: ({
        first,
        offset: [, yWheel],
        movement: [, mYWheel],
        pinching,
        memo,
        event,
      }) => {
        if (
          !imgRef.current ||
          pinching ||
          style.scale.isAnimating ||
          event.target !== imgRef.current
        )
          return memo;

        let memoLet = memo;

        resetToolbarVisibleTimer();
        const dScale = (-1 * yWheel) / RatioWheel;
        const mScale = (-1 * mYWheel) / RatioWheel;

        if (first || !memoLet) {
          const { width, height, x, y } =
            imgRef.current.getBoundingClientRect();
          const tx = (event.pageX - (x + width / 2)) / style.scale.get();
          const ty = (event.pageY - (y + height / 2)) / style.scale.get();
          memoLet = [style.x.get(), style.y.get(), tx, ty];
        }
        const dx = memoLet[0] - mScale * memoLet[2];
        const dy = memoLet[1] - mScale * memoLet[3];

        const ratio = dScale / style.scale.get();

        const point = calculateAdjustImage(
          calculateAdjustBounds(dx, dy, ratio),
          ratio,
        );
        toolbarRef.current?.setPercentValue(dScale);
        api.start({
          ...point,
          scale: dScale,
          config: {
            ...config.default,
            duration: 300,
          },
          onResolve(result) {
            api.start(
              calculateAdjustImage(
                calculateAdjustBounds(result.value.x, result.value.y),
              ),
            );
          },
        });

        return memoLet;
      },
    },
    {
      drag: {
        from: () => [style.x.get(), style.y.get()],
        axis: scale === 1 && !isDesktop ? "lock" : undefined,
        rubberband: isDesktop,
        bounds: () => {
          if (style.scale.get() === 1 && !isDesktop) return {};

          return getBounds(imgRef.current, containerRef.current) ?? {};
        },
      },
      pinch: {
        scaleBounds: { min: MinScale, max: MaxScale },
        rubberband: false,
        from: () => [style.scale.get(), style.rotate.get()],
        threshold: [0.1, 5],
        pinchOnWheel: false,
      },

      wheel: {
        from: () => [0, -style.scale.get() * RatioWheel],
        bounds: () => ({
          top: -MaxScale * RatioWheel,
          bottom: -MinScale * RatioWheel,
        }),
        axis: "y",
      },

      target: containerRef,
    },
  );

  const handleToolbarAction = useCallback(
    (action: ToolbarActionType) => {
      resetToolbarVisibleTimer();

      switch (action) {
        case ToolbarActionType.ZoomOut:
          zoomOut();
          break;
        case ToolbarActionType.ZoomIn:
          zoomIn();
          break;

        case ToolbarActionType.RotateLeft:
        case ToolbarActionType.RotateRight: {
          const dir = action === ToolbarActionType.RotateRight ? 1 : -1;
          rotateImage(dir);
          break;
        }
        case ToolbarActionType.Reset:
          restartScaleAndSize();
          break;
        default:
          break;
      }
    },
    [
      resetToolbarVisibleTimer,
      restartScaleAndSize,
      rotateImage,
      zoomIn,
      zoomOut,
    ],
  );

  const toolbarEvent = (item: ToolbarItemType) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.actionType !== undefined) {
      handleToolbarAction(item.actionType);
    }
  };

  const onError = useCallback(() => {
    if (
      window.ClientConfig?.imageThumbnails &&
      thumbnailSrc &&
      (src || isDecodedImage)
    ) {
      // if thumbnailSrc is unavailable, try to load original image
      setShowOriginSrc(true);
      return;
    }

    setIsError(true);
  }, [src, thumbnailSrc, isDecodedImage]);

  const model = React.useMemo(() => contextModel(true), [contextModel]);

  useEffect(() => {
    unmountRef.current = false;

    return () => {
      if (setTimeoutIDTapRef.current) clearTimeout(setTimeoutIDTapRef.current);
      unmountRef.current = true;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useLayoutEffect(() => {
    if (unmountRef.current || (isDecodedImage && src)) return;

    if (!isLoaded.current) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, LOADER_TIMEOUT);
    }

    isLoaded.current = false;

    setIsError(false);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src, isDecodedImage]);

  // useEffect(() => {
  //   if (!window.ClientConfig?.imageThumbnails) return;

  //   if (!thumbnailSrc) setIsLoading(true);
  // }, [thumbnailSrc]);

  // useEffect(() => {
  //   if (changeSourceTimeoutRef.current)
  //     clearTimeout(changeSourceTimeoutRef.current);
  // }, [src, version]);

  // useEffect(() => {
  //   if (!imageId || thumbnailSrc || !window.ClientConfig?.imageThumbnails)
  //     return;

  //   indexedDBHelper
  //     .getItem(IndexedDBStores.images, imageId)
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     .then((result: any) => {
  //       if (result && result.version === version) {
  //         changeSource(result.src);
  //       } else {
  //         loadImage();
  //       }
  //     });
  // }, [src, imageId, version, isTiff, loadImage, changeSource, thumbnailSrc]);

  useEffect(() => {
    const onWheelEvent = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };

    window.addEventListener("wheel", onWheelEvent, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", onWheelEvent);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      if (imgRef.current) {
        // abort img loading

        imgRef.current.src = "";
      }
    };
  }, []);

  return (
    <>
      {isMobile && !backgroundBlack ? mobileDetails : null}
      <div
        ref={containerRef}
        className={classNames(styles.container, {
          [styles.backgroundBlack]: backgroundBlack,
        })}
        data-testid="image-viewer"
        role="img"
        aria-label={errorTitle || "Image viewer"}
      >
        {isError ? (
          <MessageError
            model={model}
            isMobile={isMobile}
            onMaskClick={onMask}
            errorTitle={errorTitle}
          />
        ) : (
          <ViewerLoader isLoading={isLoading} />
        )}

        <div
          className={classNames(styles.wrapper, {
            [styles.loading]: isLoading,
          })}
          ref={imgWrapperRef}
          data-testid="image-wrapper"
        >
          <animated.img
            {...({
              className: classNames(styles.image),
              draggable: false,
              src:
                window.ClientConfig?.imageThumbnails &&
                thumbnailSrc &&
                !showOriginSrc
                  ? `${thumbnailSrc}&size=3840x2160&view=true`
                  : src,
              ref: imgRef,
              style,
              onDoubleClick: handleDoubleTapOrClick,
              onLoad: imageLoaded,
              onError,
              onContextMenu: (event: MouseEvent) => event.preventDefault(),
              "data-testid": "image-content",
            } as unknown as React.ImgHTMLAttributes<HTMLImageElement>)}
          />
        </div>
      </div>

      {isDesktop && !isMobile && panelVisible && !isError ? (
        <ViewerToolbar
          ref={toolbarRef}
          toolbar={toolbar}
          percentValue={style.scale.get()}
          generateContextMenu={generateContextMenu}
          setIsOpenContextMenu={setIsOpenContextMenu}
          toolbarEvent={toolbarEvent}
          data-testid="image-toolbar"
        />
      ) : null}
    </>
  );
};
