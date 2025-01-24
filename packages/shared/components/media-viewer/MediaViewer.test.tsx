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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import MediaViewer from "./MediaViewer";
import { DeviceType, FileStatus, FileType, FolderType } from "../../enums";

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
// jest.mock("../scrollbar", () => ({
//   CustomScrollbarsVirtualList: ({
//     children,
//   }: {
//     children: React.ReactNode;
//   }) => <div data-testid="custom-scrollbar">{children}</div>,
// }));

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
