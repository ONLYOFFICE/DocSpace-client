import lodash from "lodash";
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

import { includesMethod } from "@docspace/shared/utils/typeGuards";

import { calculateAdjustImageUtil } from "../../MediaViewer.utils";
import type { Point } from "../../MediaViewer.types";

import { PlayerBigPlayButton } from "../PlayerBigPlayButton";
import { ViewerLoader } from "../ViewerLoader";
import { PlayerPlayButton } from "../PlayerPlayButton";
import { PlayerDuration } from "../PlayerDuration/inxed";
import { PlayerVolumeControl } from "../PlayerVolumeControl";
import { PlayerTimeline } from "../PlayerTimeline";
import { PlayerSpeedControl } from "../PlayerSpeedControl";
import { PlayerFullScreen } from "../PlayerFullScreen";
import { PlayerDesktopContextMenu } from "../PlayerDesktopContextMenu";
import { KeyboardEventKeys } from "../../MediaViewer.enums";
import { MessageError } from "../MessageError";

import ViewerPlayerProps from "./ViewerPlayer.props";
import {
  ContainerPlayer,
  ControlContainer,
  PlayerControlsWrapper,
  StyledPlayerControls,
  VideoWrapper,
} from "./ViewerPlayer.styled";
import {
  VolumeLocalStorageKey,
  audioHeight,
  audioWidth,
  defaultVolume,
} from "./ViewerPlayer.constants";

export const ViewerPlayer = ({
  src,
  isAudio,
  isVideo,
  isError,
  devices,
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

        if (first) {
          memo = style.y.get();
        }

        api.start({
          x:
            (isFistImage && mdx > 0) || (isLastImage && mdx < 0) || isFullScreen
              ? style.x.get()
              : dx,
          y: dy >= memo ? dy : style.y.get(),
          opacity: mdy > 0 ? Math.max(1 - mdy / 120, 0) : style.opacity.get(),
          immediate: true,
        });

        return memo;
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
    if (!videoRef.current) return;

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
    setPanelVisible,
    restartToolbarVisibleTimer,
    removeToolbarVisibleTimer,
  ]);

  const handleBigPlayButtonClick = () => {
    togglePlay();
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

      // eslint-disable-next-line no-console
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <>
      {isMobile && panelVisible && mobileDetails}
      <ContainerPlayer ref={containerRef} $isFullScreen={isFullScreen}>
        <VideoWrapper
          $visible={!isLoading}
          style={style}
          ref={playerWrapperRef}
        >
          <animated.video
            style={lodash.omit(style, ["x", "y"])}
            src={thumbnailSrc ? src : `${src}#t=0.001`}
            playsInline
            ref={videoRef}
            hidden={isAudio}
            preload="metadata"
            poster={thumbnailSrc && `${thumbnailSrc}&size=1280x720`}
            onClick={handleClickVideo}
            onEnded={handleVideoEnded}
            onDurationChange={handleDurationChange}
            onTimeUpdate={handleTimeUpdate}
            onPlaying={() => setIsWaiting(false)}
            onWaiting={() => setIsWaiting(true)}
            onError={hadleError}
            onLoadedMetadata={handleLoadedMetaDataVideo}
          />
          <PlayerBigPlayButton
            onClick={handleBigPlayButtonClick}
            visible={!isPlaying && isVideo && !isError}
          />
          {isAudio && !isError && (
            <div className="audio-container">
              <img src={audioIcon} alt="" />
            </div>
          )}
          <ViewerLoader
            isError={isError}
            onClick={handleClickVideo}
            withBackground={isWaiting && isPlaying}
            isLoading={isLoading || (isWaiting && isPlaying)}
          />
        </VideoWrapper>
        <ViewerLoader isError={isError} isLoading={isLoading} />
      </ContainerPlayer>
      {isError ? (
        <MessageError
          model={model}
          onMaskClick={onMask}
          errorTitle={errorTitle}
          isMobile={isMobile}
        />
      ) : (
        <StyledPlayerControls
          $isShow={panelVisible && !isLoading}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onClick={handleClickVideo}
        >
          <PlayerControlsWrapper onClick={stopPropagation}>
            <PlayerTimeline
              value={timeline}
              duration={duration}
              onChange={handleChangeTimeLine}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
            <ControlContainer>
              <div
                className="player_left-control"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <PlayerPlayButton isPlaying={isPlaying} onClick={togglePlay} />
                <PlayerDuration currentTime={currentTime} duration={duration} />
                {!isMobile && (
                  <PlayerVolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onChange={handleVolumeChange}
                    toggleVolumeMute={toggleVolumeMute}
                  />
                )}
              </div>
              <div
                className="player_right-control"
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
                {isDesktop && (
                  <PlayerDesktopContextMenu
                    canDownload={canDownload}
                    isPreviewFile={isPreviewFile}
                    hideContextMenu={hideContextMenu}
                    onDownloadClick={onDownloadClick}
                    generateContextMenu={generateContextMenu}
                  />
                )}
              </div>
            </ControlContainer>
          </PlayerControlsWrapper>
        </StyledPlayerControls>
      )}
    </>
  );
};
