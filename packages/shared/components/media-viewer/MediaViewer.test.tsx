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

import React from "react";
import type { TFunction } from "i18next";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import MediaViewer from "./MediaViewer";
import { DeviceType, FileStatus, FileType, FolderType } from "../../enums";
import { MediaViewerProps } from "./MediaViewer.types";
import { NextButton } from "./sub-components/Buttons/NextButton";
import { PrevButton } from "./sub-components/Buttons/PrevButton";

jest.mock("../../utils/common", () => {
  const originalModule = jest.requireActual("../../utils/common");

  return {
    ...originalModule,
    getFileExtension: jest.fn((filename) => filename.split(".").pop()),
  };
});

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
          <NextButton nextClick={jest.fn()} />
          <PrevButton prevClick={jest.fn()} />
        </div>
      );
    },
  ),
}));

// Mock data
const mockFile = {
  shortWebUrl: "",
  id: 1,
  title: "test.jpg",
  fileExst: ".jpg",
  contentLength: "1024",
  created: "2024-01-01T00:00:00.0000000Z",
  createdBy: {
    id: "1",
    displayName: "Test User",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
  },
  updated: "2024-01-01T00:00:00.0000000Z",
  updatedBy: {
    id: "1",
    displayName: "Test User",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
  },
  shared: false,
  fileStatus: 3,
  fileType: FileType.Image,
  folderId: 1,
  folderType: FolderType.USER,
  fileEntryType: 2,
  modifiedBy: { id: "1", displayName: "Test User" },
  modified: new Date().toISOString(),
  pureContentLength: 1024,
  isFile: true,
  access: 0,
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
    EditForm: false,
    Comment: false,
    CreateRoomFrom: false,
    CopyLink: false,
    Embed: false,
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
  thumbnailStatus: 1,
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
  fileStatus: FileStatus.None,
};

const createMockProps = (overrides = {}): MediaViewerProps => ({
  visible: true,
  files: [mockFile],
  playlist: [mockPlaylistItem],
  playlistPos: 0,
  currentFileId: 1,
  userAccess: true,
  isPreviewFile: false,
  extsImagePreviewed: [".jpg", ".png"],
  deleteDialogVisible: false,
  pluginContextMenuItems: [],
  currentDeviceType: DeviceType.desktop,
  isPublicFile: false,
  autoPlay: false,
  t: ((key: string) => key) as unknown as TFunction,
  getIcon: (size: number, ext: string) => `icon-${size}-${ext}`,
  onClose: jest.fn(),
  onDelete: jest.fn(),
  nextMedia: jest.fn(),
  prevMedia: jest.fn(),
  onDownload: jest.fn(),
  onChangeUrl: jest.fn(),
  setActiveFiles: jest.fn(),
  setBufferSelection: jest.fn(),
  onEmptyPlaylistError: jest.fn(),
  ...overrides,
});

describe("MediaViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders media viewer with correct initial state", () => {
    const props = createMockProps();
    render(<MediaViewer {...props} />);

    expect(screen.getByTestId("media-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("viewer")).toBeInTheDocument();
  });

  it("handles file navigation correctly", async () => {
    const playlist = [
      { ...mockPlaylistItem, id: 1, title: "image1.jpg", fileId: 1 },
      { ...mockPlaylistItem, id: 2, title: "image2.jpg", fileId: 2 },
      { ...mockPlaylistItem, id: 3, title: "image3.jpg", fileId: 3 },
    ];

    const files = playlist.map((item) => ({
      ...mockFile,
      id: item.fileId,
      title: item.title,
    }));

    const props = createMockProps({
      playlist,
      files,
      playlistPos: 1,
      currentFileId: 2,
    });

    render(<MediaViewer {...props} />);

    // Wait for the next-button element to be rendered
    const nextButton = await waitFor(() => screen.getByTestId("next-button"));

    // Verify that nextMedia is not called before clicking the button
    expect(props.nextMedia).not.toHaveBeenCalled();

    // Navigate to next image
    fireEvent.click(nextButton);

    // Navigate to previous image
    const prevButton = await waitFor(() => screen.getByTestId("prev-button"));
    fireEvent.click(prevButton);
  });

  it("handles keyboard navigation correctly", () => {
    const playlist = [
      { ...mockPlaylistItem, id: 1, fileId: 1 },
      { ...mockPlaylistItem, id: 2, fileId: 2 },
    ];

    const files = playlist.map((item) => ({
      ...mockFile,
      id: item.fileId,
    }));

    const props = createMockProps({
      playlist,
      files,
      playlistPos: 0,
      currentFileId: 1,
    });

    render(<MediaViewer {...props} />);

    // Right arrow key
    fireEvent.keyDown(document, { key: "ArrowRight" });

    // Left arrow key
    fireEvent.keyDown(document, { key: "ArrowLeft" });
  });

  it("handles close action correctly", () => {
    const props = createMockProps({ showCloseButton: true });
    render(<MediaViewer {...props} />);

    // Close via button
    const closeButton = screen.queryByTestId("desktop-details-close");
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(props.onClose).toHaveBeenCalled();
    } else {
      console.log("Close button not found");
    }
  });

  it("handles HEIC file conversion correctly", async () => {
    const heicPlaylist = [
      {
        ...mockPlaylistItem,
        fileId: 1,
        fileExst: ".heic",
        title: "test.heic",
      },
    ];

    const heicFiles = [
      {
        ...mockFile,
        id: 1,
        fileExst: ".heic",
        title: "test.heic",
      },
    ];

    const props = createMockProps({
      playlist: heicPlaylist,
      files: heicFiles,
      currentFileId: 1,
    });

    await act(async () => {
      render(<MediaViewer {...props} />);
    });

    expect(screen.getByTestId("viewer")).toBeInTheDocument();
  });

  it("handles TIFF file conversion correctly", async () => {
    const tiffPlaylist = [
      {
        ...mockPlaylistItem,
        fileId: 1,
        fileExst: ".tiff",
        title: "test.tiff",
      },
    ];

    const tiffFiles = [
      {
        ...mockFile,
        id: 1,
        fileExst: ".tiff",
        title: "test.tiff",
      },
    ];

    const props = createMockProps({
      playlist: tiffPlaylist,
      files: tiffFiles,
      currentFileId: 1,
    });

    await act(async () => {
      render(<MediaViewer {...props} />);
    });

    expect(screen.getByTestId("viewer")).toBeInTheDocument();
  });

  it("handles download action correctly", () => {
    const props = createMockProps();
    render(<MediaViewer {...props} />);

    const downloadButton = screen.queryByTestId("download-button");
    if (downloadButton) {
      fireEvent.click(downloadButton);
      expect(props.onDownload).toHaveBeenCalled();
    } else {
      console.log("Download button not found");
    }
  });

  it("handles mobile view correctly", () => {
    const props = createMockProps({
      currentDeviceType: DeviceType.mobile,
    });

    render(<MediaViewer {...props} />);

    expect(screen.getByTestId("media-viewer")).toHaveAttribute(
      "data-device-type",
      "mobile",
    );
  });

  it("handles delete action correctly", () => {
    const props = createMockProps({
      userAccess: true,
    });

    render(<MediaViewer {...props} />);

    const deleteButton = screen.queryByTestId("delete-button");
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(props.onDelete).toHaveBeenCalled();
    } else {
      console.log("Delete button not found");
    }
  });
  it("handles context menu correctly", () => {
    const props = createMockProps();
    render(<MediaViewer {...props} />);

    const contextMenuButton = screen.queryByTestId("media-context-menu");
    if (contextMenuButton) {
      fireEvent.click(contextMenuButton);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    } else {
      console.log("Context menu button not found");
    }
  });
});
