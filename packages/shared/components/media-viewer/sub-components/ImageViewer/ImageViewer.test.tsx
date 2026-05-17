/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TFile } from "api/files/types";

import { ImageViewer } from ".";
import { getCustomToolbar } from "../../MediaViewer.helpers";
import ImageViewerProps from "./ImageViewer.props";

const file: TFile = {
  shortWebUrl: "",
  isFile: true,
  access: 0,
  canShare: true,
  comment: "",
  contentLength: "",
  created: "2024-01-01T00:00:00.0000000Z",
  createdBy: {
    avatarSmall: "",
    displayName: "",
    hasAvatar: false,
    id: "",
    profileUrl: "",
  },
  denyDownload: false,
  denySharing: false,
  fileExst: ".png",
  fileStatus: 0,
  fileType: 3,
  folderId: 17,
  fileEntryType: 2,
  id: 0,
  mute: false,
  pureContentLength: 5319693,
  rootFolderId: 2,
  rootFolderType: 14,
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
    SubmitToFormGallery: false,
    EditForm: false,
    Comment: false,
    CreateRoomFrom: false,
    CopyLink: false,
    Embed: false,
    Vectorization: false,
  },
  shared: false,
  thumbnailStatus: 1,
  title: "image_example_1.png",
  updated: "2024-02-01T09:20:29.0000000Z",
  updatedBy: {
    avatarSmall: "",
    displayName: "",
    hasAvatar: false,
    id: "",
    profileUrl: "",
  },
  version: 1,
  versionGroup: 1,
  viewAccessibility: {
    CanConvert: false,
    CoAuhtoring: false,
    ImageView: false,
    MediaView: true,
    MustConvert: false,
    WebComment: false,
    WebCustomFilterEditing: false,
    WebEdit: false,
    WebRestrictedEditing: false,
    WebReview: false,
    WebView: false,
  },
  viewUrl:
    "https://helpcenter.onlyoffice.com/ru/images/Help/Guides/big/guide139/hyperlink_settings.png",
  webUrl:
    "https://helpcenter.onlyoffice.com/ru/images/Help/Guides/big/guide139/hyperlink_settings.png",
};

const mockProps: ImageViewerProps = {
  src: "https://example.com/image.jpg",
  imageId: 2,
  version: 3,
  errorTitle: "Error loading image",
  isFistImage: true,
  isLastImage: false,
  panelVisible: true,
  backgroundBlack: false,
  isPublicFile: true,
  toolbar: getCustomToolbar(file, true),
  generateContextMenu: () => {
    return <div>Context menu</div>;
  },
  setIsOpenContextMenu: () => {},
  resetToolbarVisibleTimer: () => {},
  mobileDetails: <div>Mobile details</div>,
  thumbnailSrc: "",
  devices: {
    isMobile: false,
    isMobileOnly: false,
    isDesktop: true,
  },
  setBackgroundBlack: () => {},
  contextModel: () => [],
};

describe("ImageViewer", () => {
  it("renders image", () => {
    const { getByTestId } = render(<ImageViewer {...mockProps} />);
    expect(getByTestId("image-content")).toHaveAttribute("src", mockProps.src);
  });

  it("renders error message when image fails to load", () => {
    const errorTitle = "Error loading image";
    const { getByTestId } = render(
      <ImageViewer {...mockProps} errorTitle={errorTitle} />,
    );
    fireEvent.error(getByTestId("image-content"));
    expect(getByTestId("message-error-title")).toHaveTextContent(errorTitle);
  });

  it("calls onMask callback when image is clicked", () => {
    const onMask = vi.fn();
    const { getByTestId } = render(
      <ImageViewer {...mockProps} onMask={onMask} />,
    );
    fireEvent.click(getByTestId("image-wrapper"));
    expect(onMask).toHaveBeenCalledTimes(1);
  });
});
