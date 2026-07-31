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

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import {
  FileStatus,
  FileType,
  FolderType,
  ShareAccessRights,
} from "../../enums";
import Share from "./index";

// Mock window.matchMedia for tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the API client
vi.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the API files
vi.mock("../../api/files", () => ({
  __esModule: true,
  filesApi: {
    getSharedInfo: vi.fn().mockResolvedValue({ items: [] }),
    updateSharedInfo: vi.fn(),
  },
  getExternalLinks: vi.fn().mockResolvedValue({ items: [] }),
  addExternalLink: vi.fn().mockResolvedValue({}),
  addExternalFolderLink: vi.fn().mockResolvedValue({}),
  getFileSharedUsers: vi.fn().mockResolvedValue({ items: [] }),
}));

describe("Share component", () => {
  const createProps = (hideSharePanel: boolean) => ({
    hideSharePanel,
    selfId: "current-user-id",
    setEditLinkPanelIsVisible: vi.fn(),
    setLinkParams: vi.fn(),
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
        Vectorization: false,
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
    render(<Share {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("shared-links")).toBeInTheDocument();
    });
  });
});
