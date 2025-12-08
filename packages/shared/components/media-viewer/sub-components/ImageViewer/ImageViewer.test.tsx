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
