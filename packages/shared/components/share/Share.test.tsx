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
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  FileStatus,
  FileType,
  FolderType,
  ShareAccessRights,
} from "../../enums";
import Share from "./index";
import { renderWithTheme } from "../../utils/render-with-theme";

// Mock the API client
jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the API files
jest.mock("../../api/files", () => ({
  __esModule: true,
  filesApi: {
    getSharedInfo: jest.fn().mockResolvedValue({ items: [] }),
    updateSharedInfo: jest.fn(),
  },
  getExternalLinks: jest.fn().mockResolvedValue({ items: [] }),
}));

describe("Share component", () => {
  const createProps = (hideSharePanel: boolean) => ({
    hideSharePanel,
    selfId: "current-user-id",
    infoPanelSelection: {
      isFile: false,
      access: ShareAccessRights.None,
      canShare: true,
      comment: "Test comment",
      contentLength: "1 MB",
      created: "2025-01-09T13:47:37+03:00",
      createdBy: {
        avatarSmall: "",
        displayName: "Test User",
        hasAvatar: false,
        id: "1",
        profileUrl: "",
      },
      denyDownload: false,
      denySharing: false,
      fileExst: ".txt",
      fileStatus: FileStatus.None,
      fileType: FileType.Unknown,
      folderId: 1,
      id: 1,
      mute: false,
      pureContentLength: 1024,
      rootFolderId: 0,
      rootFolderType: FolderType.DEFAULT,
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
      shared: true,
      thumbnailStatus: 0,
      title: "Test Document",
      updated: "2025-01-09T13:47:37+03:00",
      updatedBy: {
        avatarSmall: "",
        displayName: "Test User",
        hasAvatar: false,
        id: "1",
        profileUrl: "",
      },
      version: 1,
      versionGroup: 1,
      viewAccessibility: {
        CanConvert: false,
        CoAuhtoring: true,
        ImageView: true,
        MediaView: true,
        MustConvert: false,
        WebComment: true,
        WebCustomFilterEditing: false,
        WebEdit: true,
        WebRestrictedEditing: false,
        WebReview: true,
        WebView: true,
      },
      viewUrl: "https://example.com/view",
      webUrl: "https://example.com/web",
      fileEntryType: 1,
      shortWebUrl: "",
    },
  });

  it("shows sharing status when file is shared", async () => {
    const props = createProps(false);
    renderWithTheme(<Share {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("shared-links")).toBeInTheDocument();
    });
  });
});
