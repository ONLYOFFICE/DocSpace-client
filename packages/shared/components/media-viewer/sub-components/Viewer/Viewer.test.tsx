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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Viewer } from "./index";
import { DeviceType } from "../../../../enums";
import type { PlaylistType } from "../../MediaViewer.types";
import type { TFile } from "../../../../api/files/types";

// Mock child components
jest.mock("../ImageViewer", () => ({
  ImageViewer: () => <div data-testid="image-viewer">Image Viewer</div>,
}));

jest.mock("../ViewerPlayer", () => ({
  ViewerPlayer: () => <div data-testid="viewer-player">Viewer Player</div>,
}));

jest.mock("../PDFViewer", () => ({
  PDFViewer: () => <div data-testid="pdf-viewer">PDF Viewer</div>,
}));

jest.mock("../DesktopDetails", () => ({
  DesktopDetails: () => (
    <div data-testid="desktop-details">Desktop Details</div>
  ),
}));

jest.mock("../MobileDetails", () => ({
  MobileDetails: () => <div data-testid="mobile-details">Mobile Details</div>,
}));

jest.mock("../Buttons/NextButton", () => ({
  NextButton: () => <div data-testid="next-button">Next</div>,
}));

jest.mock("../Buttons/PrevButton", () => ({
  PrevButton: () => <div data-testid="prev-button">Previous</div>,
}));

// Mock styles
jest.mock("./Viewer.module.scss", () => ({
  container: "container",
  iconWrapper: "iconWrapper",
  volumeWrapper: "volumeWrapper",
}));

// Mock MediaViewer.helpers
jest.mock("../../MediaViewer.helpers", () => ({
  getCustomToolbar: () => [],
}));

describe("Viewer", () => {
  const mockFile: TFile = {
    shortWebUrl: "",
    id: 1,
    access: 0,
    canShare: true,
    comment: "",
    contentLength: "1000",
    created: "2024-01-01T00:00:00.0000000Z",
    createdBy: {
      avatarSmall: "",
      displayName: "Test User",
      hasAvatar: false,
      id: "1",
      profileUrl: "",
    },
    fileExst: ".jpg",
    fileStatus: 0,
    fileType: 0,
    folderId: 0,
    fileEntryType: 2,
    pureContentLength: 1000,
    rootFolderType: 0,
    security: {
      Convert: false,
      Copy: true,
      CustomFilter: false,
      Delete: true,
      Download: true,
      Duplicate: false,
      Edit: true,
      EditHistory: false,
      FillForms: false,
      Lock: false,
      Move: true,
      Read: true,
      ReadHistory: false,
      Rename: true,
      Review: false,
      SubmitToFormGallery: false,
      EditForm: false,
      Comment: false,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
    },
    shared: false,
    title: "test.jpg",
    updated: "2025-02-14T19:43:18.0000000+05:00",
    version: 1,
    versionGroup: 1,
    viewUrl: "test.jpg",
    isFile: true,
    denyDownload: false,
    denySharing: false,
    mute: false,
    availableExternalRights: {
      Comment: true,
      CustomFilter: false,
      Editing: true,
      None: false,
      Read: true,
      Restrict: false,
      Review: false,
      FillForms: false,
    },
    providerId: 0,
    providerKey: "",
    providerItem: false,
    thumbnailUrl: "",
    expired: "",
    isForm: false,
    rootFolderId: 1,
    thumbnailStatus: 0,
    viewAccessibility: {
      CanConvert: false,
      CoAuhtoring: false,
      ImageView: true,
      MediaView: true,
      MustConvert: false,
      WebComment: true,
      WebCustomFilterEditing: false,
      WebEdit: true,
      WebRestrictedEditing: false,
      WebReview: false,
      WebView: true,
    },
    updatedBy: {
      id: "1",
      displayName: "Test User",
      avatarSmall: "",
      hasAvatar: false,
      profileUrl: "",
    },
    webUrl: "",
  };

  const mockPlaylist: PlaylistType[] = [
    {
      id: 1,
      canShare: true,
      fileExst: ".jpg",
      fileId: 1,
      fileStatus: 0,
      src: "test1.jpg",
      title: "test1.jpg",
      thumbnailUrl: "thumb1.jpg",
      version: 1,
    },
    {
      id: 2,
      canShare: true,
      fileExst: ".jpg",
      fileId: 2,
      fileStatus: 0,
      src: "test2.jpg",
      title: "test2.jpg",
      thumbnailUrl: "thumb2.jpg",
      version: 1,
    },
  ];

  const defaultProps = {
    title: "Test File",
    isPdf: false,
    isAudio: false,
    isImage: true,
    isVideo: false,
    visible: true,
    fileUrl: "test.jpg",
    toolbar: [],
    playlist: mockPlaylist,
    playlistPos: 0,
    autoPlay: false,
    audioIcon: "audio.svg",
    errorTitle: "Error",
    targetFile: mockFile,
    headerIcon: "header.svg",
    isPublicFile: false,
    isPreviewFile: false,
    currentDeviceType: DeviceType.desktop,
    onNextClick: jest.fn(),
    onPrevClick: jest.fn(),
    onMaskClick: jest.fn(),
    contextModel: jest.fn(() => []),
    onDownloadClick: jest.fn(),
    onSetSelectionFile: jest.fn(),
    generateContextMenu: jest.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it("renders with correct ARIA attributes", () => {
    render(<Viewer {...defaultProps} />);

    const viewer = screen.getByTestId("media-viewer");
    expect(viewer).toHaveAttribute("role", "dialog");
    expect(viewer).toHaveAttribute("aria-label", "image viewer - Test File");
    expect(viewer).toHaveAttribute("aria-modal", "true");
  });

  it("renders image viewer when isImage is true", () => {
    render(<Viewer {...defaultProps} />);
    expect(screen.getByTestId("image-viewer")).toBeInTheDocument();
  });

  it("renders video/audio player when isVideo/isAudio is true", () => {
    render(<Viewer {...defaultProps} isImage={false} isVideo />);
    expect(screen.getByTestId("viewer-player")).toBeInTheDocument();
  });

  it("renders PDF viewer when isPdf is true", () => {
    render(<Viewer {...defaultProps} isImage={false} isPdf />);
    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
  });

  it("hides navigation buttons when playlist has single item", () => {
    render(<Viewer {...defaultProps} playlist={[mockPlaylist[0]]} />);

    expect(screen.queryByTestId("prev-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("next-button")).not.toBeInTheDocument();
  });

  it("shows desktop details when not in mobile or fullscreen mode", () => {
    render(<Viewer {...defaultProps} />);
    expect(screen.getByTestId("desktop-details")).toBeInTheDocument();
  });

  it("hides desktop details in mobile mode", () => {
    render(<Viewer {...defaultProps} currentDeviceType={DeviceType.mobile} />);
    expect(screen.queryByTestId("desktop-details")).not.toBeInTheDocument();
  });
});
