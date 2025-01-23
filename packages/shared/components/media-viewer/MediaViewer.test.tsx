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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import MediaViewer from "./MediaViewer";
import { DeviceType, FileStatus, FileType, FolderType } from "../../enums";

import { NextButton } from "./sub-components/Buttons/NextButton";
import { PrevButton } from "./sub-components/Buttons/PrevButton";
import { DesktopDetails } from "./sub-components/DesktopDetails";
import { ImageViewer } from "./sub-components/ImageViewer";
import { MessageError } from "./sub-components/MessageError";

import type { ContextMenuModel } from "../context-menu/ContextMenu.types";
import { MobileDetails } from "./sub-components/MobileDetails";
import { Bookmarks } from "./sub-components/PDFViewer/ui/Bookmarks";
import { MainPanel } from "./sub-components/PDFViewer/ui/MainPanel";

// Mock i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock the CustomScrollbarsVirtualList component
jest.mock("../scrollbar", () => ({
  CustomScrollbarsVirtualList: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="custom-scrollbar">{children}</div>,
}));

// Mock SVG imports
jest.mock("PUBLIC_DIR/images/icons/16/vertical-dots.react.svg", () => ({
  __esModule: true,
  default: () => <div data-test-id="media-context-menu" />,
}));

jest.mock("PUBLIC_DIR/images/viewer.media.back.react.svg", () => ({
  __esModule: true,
  default: () => <div data-test-id="back-arrow" />,
}));

// Mock Text component
jest.mock("../text", () => ({
  Text: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock ContextMenu component
jest.mock("../context-menu", () => ({
  ContextMenu: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock ReactSVG component
jest.mock("react-svg", () => ({
  ReactSVG: ({ src }: { src: string }) => <div data-testid={`svg-${src}`} />,
}));

// Mock SVG imports
jest.mock("PUBLIC_DIR/images/viewer.media.close.svg?url", () => "close-icon");

// Mock Text component
jest.mock("../text", () => ({
  Text: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <span {...props}>{children}</span>,
}));

// Mock IconButton component
jest.mock("../icon-button", () => ({
  IconButton: ({
    "aria-label": ariaLabel,
    ...props
  }: {
    "aria-label"?: string;
    type?: "button" | "submit" | "reset"; // Define the type prop type
    [key: string]: unknown;
  }) => <button type="button" aria-label={ariaLabel} {...props} />,
}));

// Mock SVG imports

jest.mock("PUBLIC_DIR/images/viewer.next.react.svg", () => "NextIcon");
jest.mock("PUBLIC_DIR/images/viewer.prew.react.svg", () => "PrevIcon");

jest.mock(
  "PUBLIC_DIR/images/media.zoomin.react.svg",
  () => "media-zoomin-icon",
);
jest.mock(
  "PUBLIC_DIR/images/media.zoomout.react.svg",
  () => "media-zoomout-icon",
);
jest.mock(
  "PUBLIC_DIR/images/media.rotateleft.react.svg",
  () => "media-rotateleft-icon",
);
jest.mock(
  "PUBLIC_DIR/images/media.rotateright.react.svg",
  () => "media-rotateright-icon",
);
jest.mock(
  "PUBLIC_DIR/images/media.delete.react.svg",
  () => "media-delete-icon",
);
jest.mock("PUBLIC_DIR/images/download.react.svg", () => "download-icon");
jest.mock(
  "PUBLIC_DIR/images/viewer.separator.react.svg",
  () => "viewer-separator",
);
jest.mock("PUBLIC_DIR/images/panel.react.svg", () => "panel-icon");

// Mock helper functions
jest.mock("./MediaViewer.helpers", () => ({
  getPDFContextModel: jest.fn(() => []),
  getMobileMediaContextModel: jest.fn(() => []),
  getDesktopMediaContextModel: jest.fn(() => []),
  getCustomToolbar: jest.fn(() => []),
  getPDFToolbar: jest.fn(() => []),
}));

// Mock utilities
jest.mock("../../utils", () => ({
  isMobile: jest.fn(() => false),
  isTablet: jest.fn(() => false),
}));

jest.mock("../../utils/common", () => ({
  getFileExtension: jest.fn((filename) => filename.split(".").pop()),
}));

jest.mock("../../utils/checkDialogsOpen", () => ({
  checkDialogsOpen: jest.fn(() => false),
}));

jest.mock("../../utils/decodeTiff", () => ({
  decodeTiff: jest.fn(() => Promise.resolve(new Blob())),
}));

jest.mock("../../utils/typeGuards", () => ({
  isNullOrUndefined: jest.fn((value) => value === null || value === undefined),
  isSeparator: jest.fn(() => false),
}));

// Mock MediaViewer utils
jest.mock("./MediaViewer.utils", () => ({
  isHeic: jest.fn((fileExst) => fileExst === ".heic"),
  isTiff: jest.fn((fileExst) => fileExst === ".tiff"),
}));

// Mock sub-components with proper props typing
jest.mock("./sub-components/ViewerWrapper", () => ({
  ViewerWrapper: jest.fn(
    ({ visible, currentDeviceType, playlist, playlistPos }) => {
      if (
        !visible ||
        !playlist ||
        playlist.length === 0 ||
        playlistPos < 0 ||
        playlistPos >= playlist.length
      ) {
        return null;
      }
      return (
        <div data-testid="media-viewer" data-device-type={currentDeviceType}>
          <div data-testid="viewer">Viewer Component</div>
        </div>
      );
    },
  ),
}));

jest.mock("./sub-components/Viewer", () => ({
  Viewer: jest.fn(() => <div data-testid="viewer">Viewer Component</div>),
}));

jest.mock("../drop-down", () => ({
  DropDown: jest.fn(({ children }) => (
    <div data-testid="dropdown">{children}</div>
  )),
}));

jest.mock("../drop-down-item", () => ({
  DropDownItem: jest.fn(({ children }) => (
    <div data-testid="dropdown-item">{children}</div>
  )),
}));

// Mock fast-deep-equal/react
jest.mock("fast-deep-equal/react", () => jest.fn((a, b) => a === b));

// Mock heic2any
jest.mock("heic2any", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve(new Blob())),
}));

// Mock data
const mockFile = {
  id: 1,
  title: "test.jpg",
  fileExst: ".jpg",
  contentLength: "1024",
  created: new Date(),
  createdBy: {
    id: "1",
    displayName: "Test User",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
  },
  updated: new Date(),
  updatedBy: {
    id: "1",
    displayName: "Test User",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
  },
  shared: false,
  fileStatus: FileStatus.IsEditing,
  fileType: FileType.Image,
  folderId: 1,
  folderType: FolderType.USER,
  modifiedBy: { id: 1, displayName: "Test User" },
  modified: new Date().toISOString(),
  pureContentLength: 1024,
  isFile: true,
  access: 0, // ShareAccessRights.None
  canShare: false,
  comment: "",
  security: {
    Read: true,
    Delete: false,
    Download: true,
    Edit: false,
    Copy: true,
    Convert: true,
    Duplicate: false,
    EditHistory: false,
    FillForms: false,
    Lock: false,
    Move: false,
    ReadHistory: false,
    Rename: false,
    Review: false,
    SubmitToFormGallery: false,
    CustomFilter: false,
  },
  viewAccessibility: {
    WebEdit: true,
    WebRestrictedEditing: false,
    WebComment: true,
    WebDownload: true,
    WebView: true,
    CanConvert: true,
    CoAuhtoring: false,
    ImageView: true,
    MediaView: true,
    MustConvert: false,
    WebCustomFilterEditing: false,
    WebReview: false,
  },
  denyDownload: false,
  denySharing: false,
  mute: false,
  rootFolderId: 1,
  rootFolderType: FolderType.USER,
  version: 1,
  versionGroup: 1,
  viewUrl: "view.jpg",
  webUrl: "web.jpg",
  thumbnailStatus: 0,
};

const mockPlaylistItem = {
  fileId: 1,
  id: 1,
  src: "test.jpg",
  title: "test.jpg",
  fileExst: ".jpg",
  version: 1,
  versionGroup: 1,
  thumbnailUrl: "thumbnail.jpg",
  viewUrl: "view.jpg",
  webUrl: "web.jpg",
  canShare: true,
  fileStatus: 0,
};

const createMockProps = (overrides = {}) => ({
  visible: true,
  files: [mockFile],
  playlist: [mockPlaylistItem],
  playlistPos: 0,
  currentFileId: 1,
  currentDeviceType: DeviceType.desktop,
  onClose: jest.fn(),
  onClickLinkEdit: jest.fn(),
  onPreviewClick: jest.fn(),
  onCopyLink: jest.fn(),
  onCopyAction: jest.fn(),
  onClickDownload: jest.fn(),
  onClickRename: jest.fn(),
  onClickDelete: jest.fn(),
  onClickDownloadAs: jest.fn(),
  onEmptyPlaylistError: jest.fn(),
  onChangeUrl: jest.fn(),
  nextMedia: jest.fn(),
  prevMedia: jest.fn(),
  onDownload: jest.fn(),
  t: (key: string) => key,
  extsImagePreviewed: [".jpg", ".png", ".tiff", ".heic"],
  getIcon: (size: number, ext: string) => `icon-${size}-${ext}`,
  setBufferSelection: jest.fn(),
  setActiveFiles: jest.fn(),
  userAccess: true,
  archiveRoomsId: 0,
  isPreviewFile: false,
  deleteDialogVisible: false,
  pluginContextMenuItems: [],
  isPublicFile: false,
  autoPlay: false,
  ...overrides,
});

describe("MediaViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible", () => {
    render(<MediaViewer {...createMockProps()} />);
    const viewer = screen.getByTestId("media-viewer");
    expect(viewer).toBeInTheDocument();
  });
});

describe("NextButton", () => {
  const mockNextClick = jest.fn();

  beforeEach(() => {
    mockNextClick.mockClear();
  });

  it("renders correctly", () => {
    render(<NextButton nextClick={mockNextClick} />);
    const button = screen.getByTestId("next-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Next");
  });

  it("applies correct classes for non-PDF files", () => {
    render(<NextButton nextClick={mockNextClick} isPDFFile={false} />);
    const button = screen.getByTestId("next-button");
    expect(button).toHaveClass("right");
    expect(button).not.toHaveClass("isPDFFile");
  });

  it("applies correct classes for PDF files", () => {
    render(<NextButton nextClick={mockNextClick} isPDFFile />);
    const button = screen.getByTestId("next-button");
    expect(button).toHaveClass("isPDFFile");
  });

  it("calls nextClick when clicked", () => {
    render(<NextButton nextClick={mockNextClick} />);
    const button = screen.getByTestId("next-button");
    fireEvent.click(button);
    expect(mockNextClick).toHaveBeenCalledTimes(1);
  });
});

describe("PrevButton", () => {
  const mockPrevClick = jest.fn();

  beforeEach(() => {
    mockPrevClick.mockClear();
  });

  it("renders correctly", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Previous");
  });

  it("applies correct classes", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    expect(button).toHaveClass("left");
  });

  it("calls prevClick when clicked", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    fireEvent.click(button);
    expect(mockPrevClick).toHaveBeenCalledTimes(1);
  });
});

describe("DesktopDetails", () => {
  const defaultProps = {
    title: "Test Title",
    onMaskClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<DesktopDetails {...defaultProps} />);

    const container = screen.getByTestId("desktop-details");
    const title = screen.getByTestId("desktop-details-title");

    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("role", "dialog");
    expect(container).toHaveAttribute("aria-labelledby", "media-viewer-title");
    expect(title).toHaveTextContent("Test Title");
  });

  it("renders with custom className", () => {
    const customClass = "custom-class";
    render(<DesktopDetails {...defaultProps} className={customClass} />);

    const container = screen.getByTestId("desktop-details");
    expect(container).toHaveClass(customClass);
  });

  it("does not render close button by default", () => {
    render(<DesktopDetails {...defaultProps} />);

    const closeButton = screen.queryByTestId("desktop-details-close");
    expect(closeButton).not.toBeInTheDocument();
  });

  it("renders close button when showCloseButton is true", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const closeButton = screen.getByTestId("desktop-details-close");
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onMaskClick when close button is clicked", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const closeButton = screen.getByTestId("desktop-details-close");
    fireEvent.click(closeButton);

    expect(defaultProps.onMaskClick).toHaveBeenCalledTimes(1);
  });

  it("has proper accessibility attributes", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const container = screen.getByTestId("desktop-details");
    const title = screen.getByTestId("desktop-details-title");

    expect(container).toHaveAttribute("role", "dialog");
    expect(container).toHaveAttribute("aria-labelledby", "media-viewer-title");
    expect(title).toHaveAttribute("id", "media-viewer-title");

    const closeButton = screen.getByTestId("desktop-details-close");
    const iconButton = closeButton.querySelector("button");
    expect(iconButton).toHaveAttribute("aria-label", "Close details");
  });
});

describe("ImageViewer", () => {
  const props = {
    src: "https://example.com/image.jpg",
    onPrev: jest.fn(),
    onNext: jest.fn(),
    onMask: jest.fn(),
    isFistImage: true,
    isLastImage: false,
    panelVisible: true,
    generateContextMenu: jest.fn(),
    setIsOpenContextMenu: jest.fn(),
    resetToolbarVisibleTimer: jest.fn(),
    toolbar: [],
    thumbnailSrc: "https://example.com/thumbnail.jpg",
    isDecodedImage: false,
    contextModel: jest.fn(),
    errorTitle: "",
    devices: { isMobile: false, isDesktop: true, isMobileOnly: false },
    isPublicFile: false,
    backgroundBlack: false,
    setBackgroundBlack: jest.fn(),
    imageId: 0,
    version: 0,
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    rotateLeft: jest.fn(),
    rotateRight: jest.fn(),
    delete: jest.fn(),
    download: jest.fn(),
  };

  it("renders correctly", () => {
    const { getByTestId } = render(<ImageViewer {...props} />);
    expect(getByTestId("image-viewer")).toBeInTheDocument();
  });

  it("handles image loading", async () => {
    const { getByTestId } = render(<ImageViewer {...props} />);
    await waitFor(() =>
      expect(getByTestId("image-content")).toHaveAttribute("src", props.src),
    );
  });
});

describe("MessageError", () => {
  const mockOnMaskClick = jest.fn();
  const mockOnItemClick = jest.fn();

  const defaultProps = {
    errorTitle: "Test Error Message",
    isMobile: false,
    model: [
      {
        key: "download",
        label: "Download",
        icon: "download-icon.svg",
        onClick: mockOnItemClick,
        isSeparator: undefined,
      },
      {
        key: "delete",
        label: "Delete",
        icon: "delete-icon.svg",
        onClick: mockOnItemClick,
        isSeparator: undefined,
      },
    ] as ContextMenuModel[],
    onMaskClick: mockOnMaskClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders error message correctly", () => {
    render(<MessageError {...defaultProps} />);

    expect(screen.getByTestId("message-error-container")).toBeInTheDocument();
    expect(screen.getByTestId("message-error-title")).toHaveTextContent(
      "Test Error Message",
    );
  });

  it("renders toolbar items for desktop view", () => {
    render(<MessageError {...defaultProps} />);

    expect(screen.getByTestId("message-error-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-download")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-delete")).toBeInTheDocument();
  });

  it("renders only delete and download buttons in mobile view", () => {
    render(<MessageError {...defaultProps} isMobile={true} />);

    const toolbar = screen.getByTestId("message-error-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-download")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-delete")).toBeInTheDocument();
  });

  it("handles toolbar item clicks correctly", () => {
    render(<MessageError {...defaultProps} />);

    const downloadButton = screen.getByTestId("toolbar-item-download");
    fireEvent.click(downloadButton);

    expect(mockOnMaskClick).toHaveBeenCalledTimes(1);
    expect(mockOnItemClick).toHaveBeenCalledTimes(1);
  });

  it("filters out disabled items", () => {
    const propsWithDisabledItem = {
      ...defaultProps,
      model: [
        ...defaultProps.model,
        {
          key: "rename",
          label: "Rename",
          icon: "rename-icon.svg",
          onClick: mockOnItemClick,
          disabled: true,
          isSeparator: undefined,
        },
      ] as ContextMenuModel[],
    };

    render(<MessageError {...propsWithDisabledItem} />);

    expect(screen.queryByTestId("toolbar-item-rename")).not.toBeInTheDocument();
  });

  it("handles items without icons", () => {
    const propsWithNoIcon = {
      ...defaultProps,
      model: [
        ...defaultProps.model,
        {
          key: "noIcon",
          label: "No Icon",
          onClick: mockOnItemClick,
          isSeparator: undefined,
        },
      ] as ContextMenuModel[],
    };

    render(<MessageError {...propsWithNoIcon} />);

    expect(screen.queryByTestId("toolbar-item-noIcon")).not.toBeInTheDocument();
  });
});

describe("MobileDetails", () => {
  const defaultProps = {
    icon: "test-icon",
    title: "Test Title",
    isError: false,
    isPreviewFile: false,
    isPublicFile: false,
    onHide: jest.fn(),
    onMaskClick: jest.fn(),
    onContextMenu: jest.fn(),
    contextModel: jest.fn(),
  };

  const setup = (props = {}) => {
    return render(<MobileDetails {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render back button when isPublicFile is true", () => {
    setup({ isPublicFile: true });

    expect(screen.queryByTestId("mobile-details-back")).not.toBeInTheDocument();
  });

  it("does not render context menu when isPreviewFile is true", () => {
    setup({ isPreviewFile: true });

    expect(
      screen.queryByTestId("mobile-details-context"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mobile-details-context-menu"),
    ).not.toBeInTheDocument();
  });

  it("does not render context menu when isError is true", () => {
    setup({ isError: true });

    expect(
      screen.queryByTestId("mobile-details-context"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mobile-details-context-menu"),
    ).not.toBeInTheDocument();
  });
});

describe("Bookmarks component", () => {
  const mockBookmarks = [
    { page: 1, description: "Chapter 1", level: 1, y: 100 },
    { page: 5, description: "Chapter 2", level: 1, y: 200 },
    { page: 10, description: "Chapter 3", level: 1, y: 300 },
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders bookmarks list with correct accessibility attributes", () => {
    const { getByRole } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    const list = getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("aria-label", "PDF bookmarks");
  });

  it("renders empty list when no bookmarks provided", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={[]} navigate={mockNavigate} />,
    );

    const list = getByTestId("bookmarks-list");
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });

  it("renders inside CustomScrollbarsVirtualList", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    expect(getByTestId("custom-scrollbar")).toBeInTheDocument();
  });

  it("renders bookmark items with correct data-testid attributes", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    mockBookmarks.forEach((_, index) => {
      expect(getByTestId(`bookmark-item-${index}`)).toBeInTheDocument();
      expect(getByTestId(`bookmark-button-${index}`)).toBeInTheDocument();
    });
  });
});

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isDesktop: false,
}));

// Mock CSS module
jest.mock("../MainPanel.module.scss", () => ({
  wrapper: "wrapper",
  content: "content",
  isDesktop: "isDesktop",
}));

interface GestureHandlers {
  onDrag?: (state: { offset: [number]; movement: [number] }) => void;
  onDragEnd?: (state: { movement: [number] }) => void;
}

// Mock use-gesture
jest.mock("@use-gesture/react", () => ({
  useGesture: (handlers: GestureHandlers) => {
    // Store handlers for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).gestureHandlers = handlers;
  },
}));

describe("MainPanel component", () => {
  const mockProps = {
    src: "test.pdf",
    isLoading: false,
    isLastImage: false,
    isFistImage: false,
    setZoom: jest.fn(),
    onPrev: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for swipe gesture tests
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it("renders with correct accessibility attributes", () => {
    const { getByTestId } = render(<MainPanel {...mockProps} />);

    const wrapper = getByTestId("main-panel-wrapper");
    const content = getByTestId("main-panel-content");

    expect(wrapper).toHaveAttribute("role", "region");
    expect(wrapper).toHaveAttribute("aria-label", "PDF viewer main panel");

    expect(content).toHaveAttribute("role", "document");
    expect(content).toHaveAttribute("aria-busy", "false");
    expect(content).toHaveAttribute("aria-label", "PDF document test.pdf");
  });

  it("updates loading state correctly", () => {
    const { getByTestId, rerender } = render(
      <MainPanel {...mockProps} isLoading />,
    );

    const content = getByTestId("main-panel-content");
    expect(content).toHaveAttribute("data-loading", "true");
    expect(content).toHaveAttribute("aria-busy", "true");

    rerender(<MainPanel {...mockProps} isLoading={false} />);
    expect(content).toHaveAttribute("data-loading", "false");
    expect(content).toHaveAttribute("aria-busy", "false");
  });

  it("calls onNext when swiping left", () => {
    render(<MainPanel {...mockProps} />);
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with left swipe
    handlers.onDragEnd?.({ movement: [-300] }); // More than width/4 (1024/4)
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it("calls onPrev when swiping right", () => {
    render(<MainPanel {...mockProps} />);
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with right swipe
    handlers.onDragEnd?.({ movement: [300] }); // More than width/4 (1024/4)
    expect(mockProps.onPrev).toHaveBeenCalled();
  });
});
