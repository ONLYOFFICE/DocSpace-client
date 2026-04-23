// (c) Copyright Ascensio System SIA 2009-2026
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

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { RoomMember } from "@docspace/shared/api/rooms/types";
import {
  FileStatus,
  FolderType,
  ShareAccessRights,
} from "@docspace/shared/enums";

const MOCK_TITLES = [
  "Employee Onboarding.pdf",
  "Customer Feedback.pdf",
  "Leave Request.pdf",
  "Expense Report.pdf",
  "NDA Agreement.pdf",
  "Project Proposal.pdf",
  "Meeting Minutes.pdf",
  "Invoice Template.pdf",
  "Job Application.pdf",
  "Survey Form.pdf",
];

const mockUser = {
  id: "mock-user",
  displayName: "Demo User",
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
};

const mockSecurity = {
  Convert: false,
  Copy: true,
  CustomFilter: false,
  Delete: true,
  Download: true,
  Duplicate: true,
  Edit: true,
  EditHistory: false,
  FillForms: true,
  Lock: false,
  Move: true,
  Read: true,
  ReadHistory: false,
  Rename: true,
  Review: false,
  SubmitToFormGallery: false,
  StartFilling: true,
  ResetFilling: true,
  StopFilling: false,
  FillingStatus: false,
  OpenForm: true,
  EditForm: true,
  Comment: false,
  CreateRoomFrom: false,
  CopyLink: true,
  Embed: false,
  Vectorization: false,
};

const mockViewAccessibility = {
  CanConvert: false,
  CoAuhtoring: false,
  ImageView: false,
  MediaView: false,
  MustConvert: false,
  WebComment: false,
  WebCustomFilterEditing: false,
  WebEdit: true,
  WebRestrictedEditing: true,
  WebReview: false,
  WebView: true,
};

export function createMockFormFiles(): TFile[] {
  const now = new Date().toISOString();

  return MOCK_TITLES.map(
    (title, i) =>
      ({
        isFile: true,
        id: -(i + 100),
        title,
        access: ShareAccessRights.None,
        canShare: false,
        comment: "",
        contentLength: "24 KB",
        created: now,
        createdBy: mockUser,
        fileExst: ".pdf",
        fileStatus: FileStatus.None,
        fileType: 12,
        folderId: 0,
        mute: false,
        pureContentLength: 24576,
        rootFolderId: 0,
        rootFolderType: FolderType.USER,
        security: mockSecurity,
        shared: false,
        thumbnailStatus: 0,
        updated: now,
        updatedBy: mockUser,
        version: 1,
        versionGroup: 1,
        viewAccessibility: mockViewAccessibility,
        viewUrl: "",
        webUrl: "",
        shortWebUrl: "",
        isForm: true,
        fileEntryType: 1,
      }) as unknown as TFile,
  );
}

const mockFolderSecurity = {
  Read: true,
  Create: false,
  Delete: false,
  EditRoom: false,
  Rename: false,
  CopyTo: false,
  Copy: false,
  MoveTo: false,
  Move: false,
  Pin: false,
  Mute: false,
  EditAccess: false,
  Duplicate: false,
  Download: true,
  CopySharedLink: false,
  Reconnect: false,
  CreateRoomFrom: false,
  CopyLink: false,
  Embed: false,
  ChangeOwner: false,
  IndexExport: false,
};

export function createMockFormFolders(): TFolder[] {
  const now = new Date().toISOString();

  return MOCK_TITLES.map(
    (title, i) =>
      ({
        id: -(i + 200),
        parentId: 0,
        title: title.replace(".pdf", ""),
        filesCount: (i % 5) + 1,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        rootFolderId: 0,
        canShare: false,
        security: mockFolderSecurity,
        access: ShareAccessRights.None,
        shared: false,
        created: now,
        createdBy: mockUser,
        updated: now,
        updatedBy: mockUser,
        rootFolderType: FolderType.USER,
        isFolder: true,
        indexing: false,
        denyDownload: false,
        fileEntryType: 0,
      }) as unknown as TFolder,
  );
}

const MOCK_USERS = [
  "John Smith",
  "Emily Davis",
  "Michael Chen",
  "Sarah Johnson",
  "David Wilson",
];

const MOCK_LIBRARY_LANGUAGES = [
  "English",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
];

export function createMockLibraryFolders(): TFolder[] {
  const now = new Date().toISOString();

  return MOCK_LIBRARY_LANGUAGES.map(
    (title, i) =>
      ({
        id: -(i + 400),
        parentId: 0,
        title,
        filesCount: 0,
        foldersCount: 3,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        rootFolderId: 0,
        canShare: false,
        security: mockFolderSecurity,
        access: ShareAccessRights.None,
        shared: false,
        created: now,
        createdBy: mockUser,
        updated: now,
        updatedBy: mockUser,
        rootFolderType: FolderType.USER,
        isFolder: true,
        indexing: false,
        denyDownload: false,
        fileEntryType: 0,
      }) as unknown as TFolder,
  );
}

export function createMockCompletedFiles(folderTitle: string): TFile[] {
  const baseDate = new Date("2026-03-10");

  return MOCK_USERS.map((userName, i) => {
    const submitDate = new Date(baseDate);
    submitDate.setDate(submitDate.getDate() + i * 2);
    const dateStr = submitDate.toISOString().split("T")[0];
    const title = `${i + 1} - ${userName} - ${folderTitle} (${dateStr}).pdf`;
    const now = submitDate.toISOString();

    return {
      isFile: true,
      id: -(i + 300),
      title,
      access: ShareAccessRights.None,
      canShare: false,
      comment: "",
      contentLength: "32 KB",
      created: now,
      createdBy: { ...mockUser, displayName: userName },
      fileExst: ".pdf",
      fileStatus: FileStatus.None,
      fileType: 12,
      folderId: 0,
      mute: false,
      pureContentLength: 32768,
      rootFolderId: 0,
      rootFolderType: FolderType.USER,
      security: { ...mockSecurity, Edit: false, FillForms: false, StartFilling: false, ResetFilling: false, Delete: false },
      shared: false,
      thumbnailStatus: 0,
      updated: now,
      updatedBy: { ...mockUser, displayName: userName },
      version: 1,
      versionGroup: 1,
      viewAccessibility: mockViewAccessibility,
      viewUrl: "",
      webUrl: "",
      shortWebUrl: "",
      isForm: true,
      fileEntryType: 1,
    } as unknown as TFile;
  });
}

function mockMember(
  id: string,
  displayName: string,
  email: string,
  access: number,
  isAdmin: boolean,
): RoomMember {
  return {
    access,
    canEditAccess: false,
    isLocked: false,
    isOwner: false,
    subjectType: 1,
    sharedTo: {
      id,
      displayName,
      email,
      avatar: "",
      hasAvatar: false,
      isAdmin,
      isOwner: false,
    },
  } as unknown as RoomMember;
}

export function createMockRoomMembers(): RoomMember[] {
  return [
    mockMember("mock-admin-1", "Alice Johnson", "alice.johnson@example.com", 1 /* FullAccess */, true),
  ];
}
