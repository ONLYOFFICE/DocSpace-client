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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import { RoomsType, ShareAccessRights } from "../../enums";
import { renderWithTheme } from "../../utils/render-with-theme";
import { QuickButtons } from ".";
import type { QuickButtonsProps } from "./QuickButtons.types";
import { type TFile } from "../../api/files/types";

import type { TTranslation } from "../../types";

// Mock SVG imports
jest.mock("PUBLIC_DIR/images/icons/16/download.react.svg", () => {
  const DownloadIcon = () => <div data-testid="download-icon" />;

  DownloadIcon.displayName = "DownloadIcon";
  return DownloadIcon;
});
jest.mock("PUBLIC_DIR/images/link.react.svg?url", () => "link-icon.svg");
jest.mock(
  "PUBLIC_DIR/images/lifetime.react.svg?url",
  () => "lifetime-icon.svg",
);
jest.mock(
  "PUBLIC_DIR/images/create.room.react.svg?url",
  () => "create-room-icon.svg",
);
jest.mock(
  "PUBLIC_DIR/images/file.actions.locked.react.svg?url",
  () => "locked-icon.svg",
);
jest.mock(
  "PUBLIC_DIR/images/icons/12/lock.react.svg?url",
  () => "locked-icon-12.svg",
);
jest.mock(
  "PUBLIC_DIR/images/favorite.react.svg?url",
  () => "favorite-icon.svg",
);

// Mock isTablet and isDesktop
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  isTablet: jest.fn().mockReturnValue(false),
  isDesktop: jest.fn().mockReturnValue(true),
  classNames: jest.requireActual("../../utils").classNames,
  IconSizeType: jest.requireActual("../../utils").IconSizeType,
}));

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isTablet: false,
}));

const mockT: TTranslation = (
  key: string,
  params?: { [key: string]: string | number | string[] },
) => {
  const translations: Record<string, string> = {
    "Common:Download": "Download",
    "Common:CopySharedLink": "Copy Shared Link",
    "Common:CreateRoom": "Create Room",
    "Common:UnblockFile": "Unblock File",
    "Common:Favorites": "Favorites",
    "Common:LockedBy": `Locked by ${params?.userName || ""}`,
    "Common:FileWillBeDeletedPermanently": `File will be deleted permanently on ${params?.date || ""}`,
    "Common:SectionMoveNotification": `File will be moved to ${params?.sectionName || ""} on ${params?.date || ""}`,
    "Common:TrashSection": "Trash",
  };

  return translations[key] || key;
};

const baseFileItem: TFile = {
  id: 1,
  shared: false,
  security: {
    Download: true,
    Lock: true,
    Convert: true,
    Copy: true,
    CustomFilter: true,
    Delete: true,
    Duplicate: true,
    Edit: true,
    EditHistory: true,
    FillForms: true,
    Move: true,
    Read: true,
    ReadHistory: true,
    Rename: true,
    Review: true,
    SubmitToFormGallery: true,
    EditForm: true,
    Comment: true,
    CreateRoomFrom: true,
    CopyLink: true,
    Embed: true,
  },
  canShare: true,
  access: ShareAccessRights.None,
  comment: "",
  contentLength: "0",
  created: "2025-01-01",
  createdBy: {
    id: "1",
    displayName: "Test User",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
  },
  fileExst: ".docx",
  fileStatus: 0,
  fileType: 0,
  folderId: 1,
  mute: false,
  pureContentLength: 0,
  rootFolderId: 1,
  rootFolderType: 0,
  thumbnailStatus: 0,
  title: "Test File",
  updated: "2025-01-01",
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
    CoAuhtoring: true,
    ImageView: true,
    MediaView: true,
    MustConvert: false,
    WebComment: true,
    WebCustomFilterEditing: true,
    WebEdit: true,
    WebRestrictedEditing: true,
    WebReview: true,
    WebView: true,
  },
  viewUrl: "",
  webUrl: "",
  shortWebUrl: "",
  fileEntryType: 0,
};

const baseProps: QuickButtonsProps = {
  t: mockT,
  item: baseFileItem,
  viewAs: "row",
  onClickDownload: jest.fn(),
  onCopyPrimaryLink: jest.fn(),
  onClickShare: jest.fn(),
  onCreateRoom: jest.fn(),
  onClickLock: jest.fn(),
  isDisabled: false,
  isPublicRoom: false,
  isArchiveFolder: false,
  isTemplatesFolder: false,
  isIndexEditingMode: false,
  showLifetimeIcon: false,
};

describe("<QuickButtons />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    renderWithTheme(<QuickButtons {...baseProps} />);
    const buttons = screen.getAllByTestId("icon-button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders share button for personal room files", () => {
    renderWithTheme(<QuickButtons {...baseProps} />);

    const shareButton = screen.getByTitle("Copy Shared Link");
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveClass("create-share-link");
  });

  it("shows shared status when file is shared", () => {
    const sharedItem: TFile = {
      ...baseFileItem,
      shared: true,
    };

    renderWithTheme(<QuickButtons {...baseProps} item={sharedItem} />);

    const shareButton = screen.getByTitle("Copy Shared Link");
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveClass("link-shared");
  });

  it("handles share button click", async () => {
    const onClickShare = jest.fn();

    renderWithTheme(
      <QuickButtons {...baseProps} onClickShare={onClickShare} />,
    );

    const shareButton = screen.getByTitle("Copy Shared Link");
    await userEvent.click(shareButton);

    expect(onClickShare).toHaveBeenCalledTimes(1);
  });

  it("renders download button for public room files in tile view", () => {
    renderWithTheme(<QuickButtons {...baseProps} isPublicRoom viewAs="tile" />);

    const downloadButton = screen.getByTitle("Download");
    expect(downloadButton).toBeInTheDocument();
  });

  it("handles download button click", async () => {
    const onClickDownload = jest.fn();

    renderWithTheme(
      <QuickButtons
        {...baseProps}
        isPublicRoom
        viewAs="tile"
        onClickDownload={onClickDownload}
      />,
    );

    const downloadButton = screen.getByTitle("Download");
    await userEvent.click(downloadButton);

    expect(onClickDownload).toHaveBeenCalledTimes(1);
  });

  it("renders create room button for templates folder", () => {
    renderWithTheme(<QuickButtons {...baseProps} isTemplatesFolder />);

    const createRoomButton = screen.getByTitle("Create Room");
    expect(createRoomButton).toBeInTheDocument();
  });

  it("handles create room button click", async () => {
    const onCreateRoom = jest.fn();

    renderWithTheme(
      <QuickButtons
        {...baseProps}
        isTemplatesFolder
        onCreateRoom={onCreateRoom}
      />,
    );

    const createRoomButton = screen.getByTitle("Create Room");
    await userEvent.click(createRoomButton);

    expect(onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it("renders copy link button for public rooms", () => {
    const publicRoomItem = {
      ...baseFileItem,
      shared: true,
      roomType: RoomsType.PublicRoom,
      access: ShareAccessRights.RoomManager,
    };

    renderWithTheme(
      <QuickButtons {...baseProps} item={publicRoomItem} isPublicRoom />,
    );

    const copyLinkButton = screen.getByTitle("Copy Shared Link");
    expect(copyLinkButton).toBeInTheDocument();
  });

  it("handles copy link button click", async () => {
    const onCopyPrimaryLink = jest.fn();
    const publicRoomItem = {
      ...baseFileItem,
      shared: true,
      roomType: RoomsType.PublicRoom,
      access: ShareAccessRights.RoomManager,
    };

    renderWithTheme(
      <QuickButtons
        {...baseProps}
        item={publicRoomItem}
        isPublicRoom
        onCopyPrimaryLink={onCopyPrimaryLink}
      />,
    );

    const copyLinkButton = screen.getByTitle("Copy Shared Link");
    await userEvent.click(copyLinkButton);

    expect(onCopyPrimaryLink).toHaveBeenCalledTimes(1);
  });

  it("renders locked file icon when file is locked", () => {
    const lockedItem = {
      ...baseFileItem,
      locked: true,
      lockedBy: "John Doe",
    };

    renderWithTheme(<QuickButtons {...baseProps} item={lockedItem} />);

    const lockButton = screen.getByTitle("Unblock File");
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toHaveClass("file-locked");
  });

  it("handles lock button click", async () => {
    const onClickLock = jest.fn();
    const lockedItem = {
      ...baseFileItem,
      locked: true,
      lockedBy: "John Doe",
    };

    renderWithTheme(
      <QuickButtons
        {...baseProps}
        item={lockedItem}
        onClickLock={onClickLock}
      />,
    );

    const lockButton = screen.getByTitle("Unblock File");
    await userEvent.click(lockButton);

    expect(onClickLock).toHaveBeenCalledTimes(1);
  });

  it("does not call onClickLock when canLock is false", async () => {
    const onClickLock = jest.fn();
    const lockedItem = {
      ...baseFileItem,
      locked: true as unknown as boolean,
      lockedBy: "John Doe",
      security: {
        ...baseFileItem.security,
        Lock: false,
      },
    };

    renderWithTheme(
      <QuickButtons
        {...baseProps}
        item={lockedItem}
        onClickLock={onClickLock}
      />,
    );

    const lockButton = screen.getByTitle("Unblock File");
    await userEvent.click(lockButton);

    expect(onClickLock).not.toHaveBeenCalled();
  });

  it("renders lifetime icon when showLifetimeIcon is true", () => {
    renderWithTheme(
      <QuickButtons {...baseProps} showLifetimeIcon expiredDate="2025-12-31" />,
    );

    // Use getAllByTestId to get all elements with the data-testid="icon-button"
    const icons = screen.getAllByTestId("icon-button");

    // Check if at least one of them has the file-lifetime class
    const lifetimeIcon = icons.find((icon) =>
      icon.classList.contains("file-lifetime"),
    );
    expect(lifetimeIcon).toBeDefined();
  });

  it("does not render any buttons when isIndexEditingMode is true", () => {
    renderWithTheme(<QuickButtons {...baseProps} isIndexEditingMode />);

    expect(screen.queryByTitle("Copy Shared Link")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Download")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Create Room")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Unblock File")).not.toBeInTheDocument();
  });

  it("disables share button when isDisabled is true", () => {
    const onClickShare = jest.fn();
    renderWithTheme(
      <QuickButtons {...baseProps} isDisabled onClickShare={onClickShare} />,
    );

    const shareButton = screen.getByTitle("Copy Shared Link");
    expect(shareButton).toBeInTheDocument();

    fireEvent.click(shareButton);
    expect(onClickShare).not.toHaveBeenCalled();
  });

  it("renders favorites button for files", () => {
    renderWithTheme(<QuickButtons {...baseProps} />);

    const favoritesButton = screen.getByTitle("Favorites");
    expect(favoritesButton).toBeInTheDocument();
  });

  it("handles favorites button click", async () => {
    const onClickFavorite = jest.fn();
    renderWithTheme(
      <QuickButtons {...baseProps} onClickFavorite={onClickFavorite} />,
    );

    const favoritesButton = screen.getByTitle("Favorites");
    await userEvent.click(favoritesButton);
    expect(onClickFavorite).toHaveBeenCalledTimes(1);
  });

  it("does not call onClickFavorite when disabled", async () => {
    const onClickFavorite = jest.fn();
    renderWithTheme(
      <QuickButtons
        {...baseProps}
        isDisabled
        onClickFavorite={onClickFavorite}
      />,
    );

    const favoritesButton = screen.getByTitle("Favorites");
    await userEvent.click(favoritesButton);
    expect(onClickFavorite).not.toHaveBeenCalled();
  });
});
