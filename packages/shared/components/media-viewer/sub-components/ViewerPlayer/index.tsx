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

import omit from "lodash/omit";
import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import {
  isDesktop as isDesktopDeviceDetect,
  isIOS,
  isMobileOnly,
} from "react-device-detect";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import classNames from "classnames";
import { includesMethod } from "../../../../utils/typeGuards";

import type { Point } from "../../MediaViewer.types";
import { KeyboardEventKeys } from "../../MediaViewer.enums";
import { calculateAdjustImageUtil } from "../../MediaViewer.utils";

import { PlayerBigPlayButton } from "../PlayerBigPlayButton";
import { ViewerLoader } from "../ViewerLoader";
import { PlayerPlayButton } from "../PlayerPlayButton";
import { PlayerDuration } from "../PlayerDuration";
import { PlayerVolumeControl } from "../PlayerVolumeControl";
import { PlayerTimeline } from "../PlayerTimeline";
import { PlayerSpeedControl } from "../PlayerSpeedControl";
import { PlayerFullScreen } from "../PlayerFullScreen";
import { PlayerDesktopContextMenu } from "../PlayerDesktopContextMenu";
import { MessageError } from "../MessageError";

import type { PlayerTimelineRef } from "../PlayerTimeline/PlayerTimeline.props";

import type ViewerPlayerProps from "./ViewerPlayer.props";

import {
  VolumeLocalStorageKey,
  audioHeight,
  audioWidth,
  defaultVolume,
} from "./ViewerPlayer.constants";
import styles from "./ViewerPlayer.module.scss";

export const ViewerPlayer = ({
  src,
  isAudio,
  isVideo,
  isError,
  devices,
  autoPlay,
  audioIcon,
  errorTitle,
  isLastImage,
  isFistImage,
  canDownload,
  isFullScreen,
  panelVisible,
  thumbnailSrc,
  mobileDetails,
  isPreviewFile,
  isOpenContextMenu,
  onMask,
  onNext,
  onPrev,
  setIsError,
  contextModel,
  setPanelVisible,
  setIsFullScreen,
  onDownloadClick,
  generateContextMenu,
  removeToolbarVisibleTimer,
  removePanelVisibleTimeout,
  restartToolbarVisibleTimer,
}: ViewerPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const isDurationInfinityRef = useRef<boolean>(false);
  const isOpenContextMenuRef = useRef<boolean>(isOpenContextMenu);
  const timelineRef = useRef<PlayerTimelineRef>(null);

  const { isDesktop, isMobile } = devices;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const valueStorage = localStorage.getItem(VolumeLocalStorageKey);

    if (!valueStorage) return false;

    return valueStorage === "0";
  });

  const [timeline, setTimeline] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [volume, setVolume] = useState<number>(() => {
    const valueStorage = localStorage.getItem(VolumeLocalStorageKey);

    if (!valueStorage) return defaultVolume;

    return JSON.parse(valueStorage);
  });

  const [style, api] = useSpring(() => ({
    width: isAudio ? window.innerWidth : 0,
    height: isAudio ? window.innerHeight : 0,
    x: isAudio ? (window.innerWidth - audioWidth) / 2 : 0,
    y: isAudio ? (window.innerHeight - audioHeight) / 2 : 0,
    opacity: 1,
  }));

  const calculateAdjustImage = (point: Point) => {
    if (!playerWrapperRef.current || !containerRef.current) return point;

    return calculateAdjustImageUtil(
      playerWrapperRef.current,
      containerRef.current,
      point,
    );
  };

  useGesture(
    {
      onDrag: ({ offset: [dx, dy], movement: [mdx, mdy], memo, first }) => {
        if (isDesktop) return;

        let memoLet = memo;
        if (first) {
          memoLet = style.y.get();
        }

        api.start({
          x:
            (isFistImage && mdx > 0) || (isLastImage && mdx < 0) || isFullScreen
              ? style.x.get()
              : dx,
          y: dy >= memoLet ? dy : style.y.get(),
          opacity: mdy > 0 ? Math.max(1 - mdy / 120, 0) : style.opacity.get(),
          immediate: true,
        });

        return memoLet;
      },
      onDragEnd: ({ movement: [mdx, mdy] }) => {
        if (isDesktop) return;

        if (!isFullScreen) {
          if (mdx < -style.width.get() / 4) {
            return onNext?.();
          }
          if (mdx > style.width.get() / 4) {
            return onPrev?.();
          }
        }
        if (mdy > 120) {
          return onMask?.();
        }

        const newPoint = calculateAdjustImage({
          x: style.x.get(),
          y: style.y.get(),
        });

        api.start({
          ...newPoint,
          opacity: 1,
        });
      },
      onClick: ({ dragging, event }) => {
        if (isDesktopDeviceDetect && event.target === containerRef.current)
          return onMask?.();

        if (
          dragging ||
          !isMobile ||
          isAudio ||
          event.target !== containerRef.current
        )
          return;

        if (panelVisible) {
          removeToolbarVisibleTimer();
          setPanelVisible(false);
        } else {
          if (isPlaying) restartToolbarVisibleTimer();
          setPanelVisible(true);
        }
      },
    },
    {
      drag: {
        from: () => [style.x.get(), style.y.get()],
        axis: "lock",
      },
      target: containerRef,
    },
  );

  const resetState = useCallback(() => {
    setTimeline(0);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsError(false);
    removePanelVisibleTimeout();
    timelineRef.current?.setProgress(0);
  }, [removePanelVisibleTimeout, setIsError]);

  const getVideoWidthHeight = useCallback(
    (video: HTMLVideoElement): [number, number] => {
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;

      const elementWidth = isAudio ? audioWidth : video.videoWidth;
      const elementHeight = isAudio ? audioHeight : video.videoHeight;

      let width =
        elementWidth > maxWidth
          ? maxWidth
          : isFullScreen
            ? Math.max(maxWidth, elementWidth)
            : Math.min(maxWidth, elementWidth);

      let height = (width / elementWidth) * elementHeight;

      if (height > maxHeight) {
        height = maxHeight;
        width = (height / elementHeight) * elementWidth;
      }

      return [width, height];
    },
    [isAudio, isFullScreen],
  );

  const getVideoPosition = (
    width: number,
    height: number,
  ): [number, number] => {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    return [left, top];
  };

  const setSizeAndPosition = useCallback(
    (target: HTMLVideoElement) => {
      const [width, height] = getVideoWidthHeight(target);
      const [x, y] = getVideoPosition(width, height);

      api.start({
        x,
        y,
        width,
        height,
        immediate: true,
      });
    },
    [api, getVideoWidthHeight],
  );

  const handleResize = useCallback(() => {
    const target = videoRef.current;

    if (!target || isLoading) return;

    setSizeAndPosition(target);
  }, [isLoading, setSizeAndPosition]);

  const handleLoadedMetaDataVideo = (
    event: React.SyntheticEvent<HTMLVideoElement, Event>,
  ) => {
    const target = event.target as HTMLVideoElement;

    setSizeAndPosition(target);

    target.volume = volume / 100;
    target.muted = isMuted;
    target.playbackRate = 1;

    if (target.duration === Infinity) {
      isDurationInfinityRef.current = true;
      target.currentTime = Number.MAX_SAFE_INTEGER;
      return;
    }
    setDuration(target.duration);
    setIsLoading(false);
  };

  const handleDurationChange = (
    event: React.SyntheticEvent<HTMLVideoElement, Event>,
  ) => {
    const target = event.target as HTMLVideoElement;
    if (!Number.isFinite(target.duration) || !isDurationInfinityRef.current)
      return;

    target.currentTime = 0;
    isDurationInfinityRef.current = false;
    setDuration(target.duration);
    setIsLoading(false);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current || isError) return;

    if (isMobile && !isPlaying && isVideo) {
      restartToolbarVisibleTimer();
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setPanelVisible(true);
      if (isMobile) removeToolbarVisibleTimer();
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [
    isMobile,
    isPlaying,
    isVideo,
    isError,
    setPanelVisible,
    restartToolbarVisibleTimer,
    removeToolbarVisibleTimer,
  ]);

  const handleBigPlayButtonClick = () => {
    togglePlay();
  };

  const handleProgress = () => {
    if (!videoRef.current) return;

    let range = 0;
    const bf = videoRef.current.buffered;
    const time = videoRef.current.currentTime;

    while (
      bf.length > range &&
      !(bf.start(range) <= time && time <= bf.end(range))
    ) {
      range += 1;
    }

    if (bf.length <= range)
      return timelineRef.current?.setProgress(
        videoRef.current.currentTime / videoRef.current.duration,
      );

    const loadEndPercentage = bf.end(range) / videoRef.current.duration;

    timelineRef.current?.setProgress(loadEndPercentage);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isLoading) return;

    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;

    setTimeline(percent);

    setCurrentTime(videoRef.current.currentTime);
  };

  const handleChangeTimeLine = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const percent = Number(event.target.value);
    const newCurrentTime = (percent / 100) * videoRef.current.duration;

    const videoCurrentTime = videoRef.current.currentTime;

    if (Math.abs(newCurrentTime - videoCurrentTime) <= 0.1) return;

    handleProgress();
    setTimeline(percent);
    setCurrentTime(newCurrentTime);
    videoRef.current.currentTime = newCurrentTime;
  };

  const handleClickVideo = () => {
    if (isMobile) {
      if (!isPlaying) {
        return setPanelVisible((prev) => !prev);
      }

      if (panelVisible) {
        videoRef.current?.pause();
        setIsPlaying(false);
        return removeToolbarVisibleTimer();
      }

      return isPlaying && restartToolbarVisibleTimer();
    }
    togglePlay();
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);

    if (isMobile) removePanelVisibleTimeout();
  };

  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;

      const newVolume = Number(event.target.value);
      localStorage.setItem(VolumeLocalStorageKey, event.target.value);

      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      }

      if (isMuted && newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }

      videoRef.current.volume = newVolume / 100;
      setVolume(newVolume);
    },
    [isMuted],
  );

  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = speed;
  }, []);

  const toggleVolumeMute = useCallback(() => {
    if (!videoRef.current) return;

    const newVolume = videoRef.current.volume * 100 || defaultVolume;

    if (isMuted) {
      setIsMuted(false);
      setVolume(newVolume);

      videoRef.current.volume = newVolume / 100;
      videoRef.current.muted = false;

      localStorage.setItem(VolumeLocalStorageKey, newVolume.toString());
    } else {
      setIsMuted(true);
      setVolume(0);
      videoRef.current.muted = true;
      localStorage.setItem(VolumeLocalStorageKey, "0");
    }
  }, [isMuted]);

  const toggleVideoFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (isIOS && isMobileOnly) {
      videoRef.current.pause();
      videoRef.current.playsInline = false;
      videoRef.current.play();
      videoRef.current.playsInline = true;

      return;
    }

    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (includesMethod(document, "webkitExitFullscreen")) {
        document.webkitExitFullscreen();
      } else if (includesMethod(document, "mozCancelFullScreen")) {
        document.mozCancelFullScreen();
      } else if (includesMethod(document, "msExitFullscreen")) {
        document.msExitFullscreen();
      }
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (
      includesMethod(document.documentElement, "mozRequestFullScreen")
    ) {
      document.documentElement.mozRequestFullScreen();
    } else if (
      includesMethod(document.documentElement, "webkitRequestFullScreen")
    ) {
      document.documentElement.webkitRequestFullScreen();
    } else if (
      includesMethod(document.documentElement, "webkitEnterFullScreen")
    ) {
      document.documentElement.webkitEnterFullScreen();
    }

    setIsFullScreen((pre) => !pre);
  }, [isFullScreen, setIsFullScreen]);

  const onMouseEnter = () => {
    if (isMobile) return;

    removeToolbarVisibleTimer();
  };
  const onMouseLeave = () => {
    if (isMobile) return;

    restartToolbarVisibleTimer();
  };

  const onTouchStart = () => {
    if (isPlaying && isVideo) restartToolbarVisibleTimer();
  };

  const hadleError = useCallback(
    (error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      setIsError(true);
      setIsLoading(false);

      console.error("video error", error);
    },
    [setIsError],
  );

  const stopPropagation = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event?.stopPropagation();
    },
    [],
  );

  const onTouchMove = () => {
    if (isPlaying && isVideo) restartToolbarVisibleTimer();
  };

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === KeyboardEventKeys.Space) {
        togglePlay();
      }
    },
    [togglePlay],
  );

  const onExitFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
      handleResize();
    }
  }, [handleResize, setIsFullScreen]);

  const model = useMemo(contextModel, [contextModel]);
  const hideContextMenu = useMemo(
    () => model.filter((item) => !item.disabled).length <= 1,
    [model],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useLayoutEffect(() => {
    setIsLoading(true);
    resetState();
  }, [src]);

  useEffect(() => {
    if (isOpenContextMenuRef.current === isOpenContextMenu) return;
    isOpenContextMenuRef.current = isOpenContextMenu;

    if (!isOpenContextMenu && isPlaying) {
      restartToolbarVisibleTimer();
    }
  }, [isOpenContextMenu, isPlaying, restartToolbarVisibleTimer]);

  useEffect(() => {
    window.addEventListener("fullscreenchange", onExitFullScreen, {
      capture: true,
    });
    return () =>
      window.removeEventListener("fullscreenchange", onExitFullScreen, {
        capture: true,
      });
  }, [onExitFullScreen]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const posterUrl = thumbnailSrc ? `${thumbnailSrc}` : undefined;

  return (
    <>
      {isMobile && panelVisible ? mobileDetails : null}
      <div
        className={classNames(styles.containerPlayer, {
          [styles.isFullScreen]: isFullScreen,
        })}
        ref={containerRef}
      >
        {/* @ts-expect-error - React Spring types issue with React 19 */}
        <animated.div
          className={classNames(styles.videoWrapper, {
            [styles.visible]: !isLoading,
          })}
          style={style}
          ref={playerWrapperRef}
        >
          <animated.video
            {...({
              playsInline: true,
              ref: videoRef,
              hidden: isAudio,
              autoPlay,
              preload: "metadata",
              style: omit(style, ["x", "y"]),
              src: thumbnailSrc ? src : `${src}#t=0.001`,
              poster: posterUrl,
              onError: hadleError,
              onClick: handleClickVideo,
              onEnded: handleVideoEnded,
              onProgress: handleProgress,
              onTimeUpdate: handleTimeUpdate,
              onWaiting: () => setIsWaiting(true),
              onPlaying: () => setIsWaiting(false),
              onDurationChange: handleDurationChange,
              onLoadedMetadata: handleLoadedMetaDataVideo,
              onPlay: () => setIsPlaying(true),
              onContextMenu: (event: MouseEvent) => event.preventDefault(),
              "aria-label": isAudio ? "Audio player" : "Video player",
              "data-testid": "media-player",
            } as unknown as React.VideoHTMLAttributes<HTMLVideoElement>)}
          />

          <PlayerBigPlayButton
            onClick={handleBigPlayButtonClick}
            visible={!isPlaying && isVideo ? !isError : false}
          />
          {isAudio && !isError ? (
            <div className={styles.audioContainer}>
              <img src={audioIcon} alt="" />
            </div>
          ) : null}
          <ViewerLoader
            isError={isError}
            onClick={handleClickVideo}
            withBackground={isWaiting ? isPlaying : false}
            isLoading={isLoading || (isWaiting && isPlaying)}
          />
        </animated.div>
        <ViewerLoader isError={isError} isLoading={isLoading} />
      </div>
      {isError ? (
        <MessageError
          model={model}
          onMaskClick={onMask}
          errorTitle={errorTitle}
          isMobile={isMobile}
        />
      ) : (
        <div
          className={classNames(styles.playerControls, {
            [styles.show]: panelVisible ? !isLoading : false,
          })}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onClick={handleClickVideo}
        >
          <div
            className={styles.playerControlsWrapper}
            onClick={stopPropagation}
          >
            <PlayerTimeline
              value={timeline}
              ref={timelineRef}
              duration={duration}
              onChange={handleChangeTimeLine}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
            <div className={styles.controlContainer}>
              <div
                className={styles.playerLeftControl}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <PlayerPlayButton isPlaying={isPlaying} onClick={togglePlay} />
                <PlayerDuration currentTime={currentTime} duration={duration} />
                {!isMobile ? (
                  <PlayerVolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onChange={handleVolumeChange}
                    toggleVolumeMute={toggleVolumeMute}
                  />
                ) : null}
              </div>
              <div
                className={styles.playerRightControl}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <PlayerSpeedControl
                  src={src}
                  onMouseLeave={onMouseLeave}
                  handleSpeedChange={handleSpeedChange}
                />
                <PlayerFullScreen
                  isAudio={isAudio}
                  isFullScreen={isFullScreen}
                  onClick={toggleVideoFullscreen}
                />
                {isDesktop ? (
                  <PlayerDesktopContextMenu
                    canDownload={canDownload}
                    isPreviewFile={isPreviewFile}
                    hideContextMenu={hideContextMenu}
                    onDownloadClick={onDownloadClick}
                    generateContextMenu={generateContextMenu}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
