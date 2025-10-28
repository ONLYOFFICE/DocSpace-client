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

import { render, fireEvent } from "@testing-library/react";
import { ViewerWrapper } from ".";
import {
  ShareAccessRights,
  FileStatus,
  FileType,
  FolderType,
  DeviceType,
} from "../../../../enums";
import type { TFile } from "../../../../api/files/types";
import type { PlaylistType } from "../../MediaViewer.types";

// Mock the Viewer component
jest.mock("../Viewer", () => ({
  Viewer: jest.fn(
    ({
      isImage,
      isPdf,
      isVideo,
      isAudio,
      onMaskClick,
      onNextClick,
      onPrevClick,
    }) => (
      <div>
        <div data-test-id="viewer" />
        {isImage ? (
          <div
            data-test-id="viewer-wrapper-container"
            aria-label="Image viewer"
          />
        ) : null}
        {isPdf ? (
          <div data-test-id="pdf-viewer-container" aria-label="PDF viewer" />
        ) : null}
        {isVideo ? (
          <div
            data-test-id="video-viewer-container"
            aria-label="Video player"
          />
        ) : null}
        {isAudio ? (
          <div
            data-test-id="audio-player-container"
            aria-label="Audio player"
          />
        ) : null}
        <button
          type="button"
          data-test-id="viewer-close-button"
          onClick={onMaskClick}
          aria-label="Close"
        >
          Close
        </button>
        <button
          type="button"
          data-test-id="viewer-next-button"
          onClick={onNextClick}
          aria-label="Next"
        />
        <button
          type="button"
          data-test-id="viewer-prev-button"
          onClick={onPrevClick}
          aria-label="Previous"
        />
        <div data-test-id="viewer-context-menu" />
      </div>
    ),
  ),
}));

// Mock the VirtualList component
jest.mock("../../../drop-down/sub-components/VirtualList", () => ({
  VirtualList: jest.fn(({ children }) => <div>{children}</div>),
}));

describe("ViewerWrapper", () => {
  const mockFile: TFile = {
    shortWebUrl: "",
    isFile: true,
    access: ShareAccessRights.None,
    canShare: false,
    comment: "",
    contentLength: "1024",
    created: "2024-01-01T00:00:00.0000000Z",
    createdBy: {
      id: "1",
      displayName: "Test User",
      avatarSmall: "",
      hasAvatar: false,
      profileUrl: "",
    },
    denyDownload: false,
    denySharing: false,
    fileExst: ".jpg",
    fileStatus: FileStatus.None,
    fileType: FileType.Image,
    folderId: 1,
    fileEntryType: 2,
    id: 1,
    mute: false,
    pureContentLength: 1024,
    rootFolderId: 1,
    rootFolderType: FolderType.DEFAULT,
    security: {
      Convert: true,
      Copy: true,
      CustomFilter: true,
      Delete: true,
      Download: true,
      Duplicate: true,
      Edit: true,
      EditHistory: true,
      FillForms: true,
      Lock: true,
      Move: true,
      Read: true,
      ReadHistory: true,
      Rename: true,
      Review: true,
      SubmitToFormGallery: true,
      EditForm: false,
      Comment: false,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
      Vectorization: false,
    },
    shared: false,
    thumbnailStatus: 0,
    title: "test.jpg",
    updated: "2025-02-14T19:43:18.0000000+05:00",
    updatedBy: {
      id: "1",
      displayName: "Test User",
      avatarSmall: "",
      hasAvatar: false,
      profileUrl: "",
    },
    version: 1,
    versionGroup: 1,
    viewAccessibility: {
      CanConvert: true,
      CoAuhtoring: false,
      ImageView: true,
      MediaView: true,
      MustConvert: false,
      WebComment: false,
      WebCustomFilterEditing: false,
      WebEdit: false,
      WebRestrictedEditing: false,
      WebReview: false,
      WebView: true,
    },
    viewUrl: "test-url",
    webUrl: "test-web-url",
  };

  const mockPlaylist: PlaylistType[] = [
    {
      id: 1,
      canShare: true,
      fileExst: ".jpg",
      fileId: 1,
      fileStatus: 0,
      src: "test-url-1",
      title: "File 1",
      thumbnailUrl: "thumb-1",
      version: 1,
    },
    {
      id: 2,
      canShare: true,
      fileExst: ".jpg",
      fileId: 2,
      fileStatus: 0,
      src: "test-url-2",
      title: "File 2",
      thumbnailUrl: "thumb-2",
      version: 1,
    },
  ];

  const baseProps = {
    isPdf: false,
    title: "Test File",
    isAudio: false,
    isVideo: false,
    visible: true,
    fileUrl: "test-url",
    isImage: true,
    playlist: [],
    audioIcon: "",
    targetFile: mockFile,
    userAccess: true,
    errorTitle: "",
    headerIcon: "",
    playlistPos: 0,
    isPreviewFile: false,
    currentDeviceType: DeviceType.desktop,
    isPublicFile: false,
    autoPlay: false,
    onClose: jest.fn(),
    onNextClick: jest.fn(),
    onPrevClick: jest.fn(),
    contextModel: () => [],
    onDeleteClick: jest.fn(),
    onDownloadClick: jest.fn(),
    onSetSelectionFile: jest.fn(),
  };

  it("renders without crashing", () => {
    const { container } = render(<ViewerWrapper {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders Viewer component with correct props", () => {
    const { container } = render(<ViewerWrapper {...baseProps} />);
    expect(container.querySelector('[data-test-id="viewer"]')).toBeTruthy();
  });

  it("handles image viewer correctly", () => {
    const { container } = render(<ViewerWrapper {...baseProps} isImage />);
    const viewerContainer = container.querySelector(
      '[data-test-id="viewer-wrapper-container"]',
    );
    expect(viewerContainer).toBeTruthy();
    expect(viewerContainer?.getAttribute("aria-label")).toBe("Image viewer");
  });

  it("handles PDF viewer correctly", () => {
    const { container } = render(<ViewerWrapper {...baseProps} isPdf />);
    const pdfContainer = container.querySelector(
      '[data-test-id="pdf-viewer-container"]',
    );
    expect(pdfContainer).toBeTruthy();
    expect(pdfContainer?.getAttribute("aria-label")).toBe("PDF viewer");
  });

  it("handles video viewer correctly", () => {
    const { container } = render(<ViewerWrapper {...baseProps} isVideo />);
    const videoContainer = container.querySelector(
      '[data-test-id="video-viewer-container"]',
    );
    expect(videoContainer).toBeTruthy();
    expect(videoContainer?.getAttribute("aria-label")).toBe("Video player");
  });

  it("handles audio player correctly", () => {
    const { container } = render(<ViewerWrapper {...baseProps} isAudio />);
    const audioContainer = container.querySelector(
      '[data-test-id="audio-player-container"]',
    );
    expect(audioContainer).toBeTruthy();
    expect(audioContainer?.getAttribute("aria-label")).toBe("Audio player");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <ViewerWrapper {...baseProps} onClose={onClose} />,
    );
    const closeButton = container.querySelector(
      '[data-test-id="viewer-close-button"]',
    );
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it("calls navigation functions correctly", () => {
    const onNextClick = jest.fn();
    const onPrevClick = jest.fn();
    const { container } = render(
      <ViewerWrapper
        {...baseProps}
        onNextClick={onNextClick}
        onPrevClick={onPrevClick}
        playlist={mockPlaylist}
      />,
    );

    const nextButton = container.querySelector(
      '[data-test-id="viewer-next-button"]',
    );
    const prevButton = container.querySelector(
      '[data-test-id="viewer-prev-button"]',
    );

    if (nextButton) {
      fireEvent.click(nextButton);
    }

    expect(onNextClick).toHaveBeenCalled();

    if (prevButton) {
      fireEvent.click(prevButton);
    }

    expect(onPrevClick).toHaveBeenCalled();
  });

  it("handles context menu correctly", () => {
    const contextModel = () => [
      { key: "download", label: "Download", onClick: jest.fn() },
    ];
    const { container } = render(
      <ViewerWrapper {...baseProps} contextModel={contextModel} />,
    );
    const menu = container.querySelector(
      '[data-test-id="viewer-context-menu"]',
    );
    expect(menu).toBeTruthy();
  });
});
