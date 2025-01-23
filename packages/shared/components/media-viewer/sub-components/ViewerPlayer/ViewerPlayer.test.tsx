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

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ViewerPlayer } from "./index";

// Mock useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock SVG imports
jest.mock("PUBLIC_DIR/images/media.viewer.play.react.svg", () => "play.svg");
jest.mock("PUBLIC_DIR/images/media.viewer.pause.react.svg", () => "pause.svg");
jest.mock(
  "PUBLIC_DIR/images/media.viewer.volume.react.svg",
  () => "volume.svg",
);
jest.mock("PUBLIC_DIR/images/media.viewer.mute.react.svg", () => "mute.svg");
jest.mock(
  "PUBLIC_DIR/images/media.viewer.fullscreen.react.svg",
  () => "fullscreen.svg",
);
jest.mock(
  "PUBLIC_DIR/images/media.viewer.fullscreen.exit.react.svg",
  () => "fullscreen-exit.svg",
);
jest.mock("PUBLIC_DIR/images/media.viewer.audio.react.svg", () => "audio.svg");

// Mock external components
jest.mock("../../../../components/text", () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock("react-svg", () => ({
  ReactSVG: ({ src }: any) => <div data-testid="svg-icon" data-src={src} />,
}));

// Mock child components
jest.mock("../PlayerBigPlayButton", () => ({
  PlayerBigPlayButton: ({ onClick, visible }: any) => (
    <div
      data-testid="big-play-button"
      onClick={onClick}
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      Big Play Button
    </div>
  ),
}));

jest.mock("../ViewerLoader", () => ({
  ViewerLoader: ({ isLoading }: any) => (
    <div
      data-testid="viewer-loader"
      style={{ display: isLoading ? "block" : "none" }}
    >
      Loading...
    </div>
  ),
}));

jest.mock("../PlayerPlayButton", () => ({
  PlayerPlayButton: ({ isPlaying, onClick }: any) => (
    <div
      data-testid="play-button"
      onClick={onClick}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? "Pause" : "Play"}
    </div>
  ),
}));

jest.mock("../PlayerTimeline", () => ({
  PlayerTimeline: React.forwardRef(function PlayerTimelineMock(
    { value, onChange }: any,
    ref: React.Ref<HTMLDivElement>,
  ) {
    React.useImperativeHandle(
      ref,
      () =>
        ({
          setProgress: jest.fn(),
        }) as unknown as HTMLDivElement,
    );

    return (
      <div data-testid="timeline" aria-label="Video progress" ref={ref}>
        Timeline
      </div>
    );
  }),
}));

jest.mock("../PlayerVolumeControl", () => ({
  PlayerVolumeControl: ({
    volume,
    isMuted,
    onChange,
    toggleVolumeMute,
  }: any) => (
    <div data-testid="volume-control">
      <button
        type="button"
        onClick={toggleVolumeMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <input type="range" value={volume} onChange={onChange} />
    </div>
  ),
}));

jest.mock("../PlayerFullScreen", () => ({
  PlayerFullScreen: ({ isAudio, isFullScreen, onClick }: any) => (
    <div data-testid="fullscreen-button" onClick={onClick}>
      {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    </div>
  ),
}));

jest.mock("../MessageError", () => ({
  MessageError: ({ errorTitle }: any) => (
    <div data-testid="message-error">{errorTitle}</div>
  ),
}));

jest.mock("../PlayerDesktopContextMenu", () => ({
  PlayerDesktopContextMenu: jest.fn(
    ({ onDownloadClick, generateContextMenu }: any) => (
      <div data-testid="context-menu">
        <div data-testid="download-button" onClick={onDownloadClick} />
        <div data-testid="context-menu-button" onClick={generateContextMenu} />
      </div>
    ),
  ),
}));

// Mock lodash/omit
jest.mock("lodash/omit", () => ({
  __esModule: true,
  default: (obj: any, keys: string[]) => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },
}));

// Mock @use-gesture/react
jest.mock("@use-gesture/react", () => ({
  useGesture: () => ({}),
}));

// Mock @react-spring/web
jest.mock("@react-spring/web", () => ({
  useSpring: () => [
    {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      opacity: 1,
      transform: "scale(1)",
    },
    {
      start: jest.fn(),
    },
  ],
  animated: {
    div: ({ children, style, ...props }: any) => (
      <div style={{ ...style }} {...props}>
        {children}
      </div>
    ),
    video: ({ children, style, ...props }: any) => (
      <video data-testid="media-player" style={{ ...style }} {...props}>
        <track kind="captions" srcLang="en" src="captions.vtt" />
        {children}
      </video>
    ),
  },
}));

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isDesktop: true,
  isIOS: false,
  isMobileOnly: false,
}));

// Mock utils
jest.mock("../../../../utils/typeGuards", () => ({
  includesMethod: () => true,
}));

jest.mock("../../MediaViewer.utils", () => ({
  calculateAdjustImageUtil: jest.fn(() => ({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })),
  formatTime: jest.fn(() => "00:00"),
}));

describe("ViewerPlayer", () => {
  const defaultProps = {
    src: "test.mp4",
    isAudio: false,
    isVideo: true,
    isError: false,
    devices: {
      isDesktop: true,
      isMobile: false,
      isMobileOnly: false,
    },
    autoPlay: false,
    audioIcon: "audio.svg",
    errorTitle: "Error",
    isLastImage: false,
    isFistImage: false,
    canDownload: true,
    isFullScreen: false,
    panelVisible: true,
    thumbnailSrc: "thumb.jpg",
    mobileDetails: <div>Mobile Details</div>,
    isPreviewFile: false,
    isOpenContextMenu: false,
    onMask: jest.fn(),
    onNext: jest.fn(),
    onPrev: jest.fn(),
    setIsError: jest.fn(),
    contextModel: () => [],
    setPanelVisible: jest.fn(),
    setIsFullScreen: jest.fn(),
    onDownloadClick: jest.fn(),
    generateContextMenu: jest.fn(),
    removeToolbarVisibleTimer: jest.fn(),
    removePanelVisibleTimeout: jest.fn(),
    restartToolbarVisibleTimer: jest.fn(),
  };

  beforeAll(() => {
    // Mock window.ResizeObserver
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock window.IntersectionObserver
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock HTMLMediaElement methods and properties
    Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockImplementation(() => Promise.resolve()),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "duration", {
      configurable: true,
      get: jest.fn().mockReturnValue(100),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "currentTime", {
      configurable: true,
      get: jest.fn().mockReturnValue(0),
      set: jest.fn(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "readyState", {
      configurable: true,
      get: jest.fn().mockReturnValue(4), // HAVE_ENOUGH_DATA
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("renders video player with correct ARIA attributes", () => {
    render(<ViewerPlayer {...defaultProps} />);

    const video = screen.getByTestId("media-player");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("aria-label", "Video player");
    expect(video).toHaveAttribute("preload", "metadata");

    const playButton = screen.getByTestId("play-button");
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveAttribute("aria-label", "Play");

    const timeline = screen.getByTestId("timeline");
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveAttribute("aria-label", "Video progress");
  });

  it("renders audio player with correct ARIA attributes", () => {
    render(<ViewerPlayer {...defaultProps} isAudio isVideo={false} />);

    const audio = screen.getByTestId("media-player");
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute("aria-label", "Audio player");
    expect(audio).toHaveAttribute("hidden", "");
  });

  it("shows error state correctly", () => {
    render(<ViewerPlayer {...defaultProps} isError />);

    const errorMessage = screen.getByTestId("message-error");
    expect(errorMessage).toBeInTheDocument();
    expect(screen.queryByTestId("play-button")).not.toBeInTheDocument();
  });

  it("handles download click correctly", () => {
    render(<ViewerPlayer {...defaultProps} />);

    const downloadButton = screen.getByTestId("download-button");
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);
    expect(defaultProps.onDownloadClick).toHaveBeenCalled();
  });

  it("handles context menu correctly", () => {
    render(<ViewerPlayer {...defaultProps} />);

    const contextMenuButton = screen.getByTestId("context-menu-button");
    expect(contextMenuButton).toBeInTheDocument();

    fireEvent.click(contextMenuButton);
    expect(defaultProps.generateContextMenu).toHaveBeenCalled();
  });
});
