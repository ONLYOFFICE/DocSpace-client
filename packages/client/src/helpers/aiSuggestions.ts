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

import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { Suggestion } from "@docspace/ui-kit/ai-agent/providers";

export type SuggestionSection =
  | "formRoom"
  | "editingRoom"
  | "customRoom"
  | "publicRoom"
  | "virtualDataRoom"
  | "aiRoom"
  | "documents"
  | "sharedWithMe"
  | "recent"
  | "favorites"
  | "trash"
  | "archive"
  | "rooms"
  | "default";

export const SUGGESTIONS_BY_SECTION: Record<SuggestionSection, Suggestion[]> = {
  formRoom: [
    { name: "Summarize form", prompt: "Summarize this form" },
    { name: "Check required fields", prompt: "List the required fields" },
  ],
  editingRoom: [
    { name: "Improve writing", prompt: "Improve the writing of this document" },
    { name: "Summarize", prompt: "Summarize this document" },
  ],
  customRoom: [
    { name: "Summarize room", prompt: "Summarize the files in this room" },
    { name: "Find action items", prompt: "List the action items" },
  ],
  publicRoom: [
    { name: "Summarize room", prompt: "Summarize the files in this room" },
    { name: "Explain sharing", prompt: "Who can access this public room?" },
  ],
  virtualDataRoom: [
    { name: "Summarize documents", prompt: "Summarize the documents here" },
    { name: "Find action items", prompt: "List the action items" },
  ],
  aiRoom: [
    { name: "What can you do?", prompt: "What can you help me with here?" },
    { name: "Analyze results", prompt: "Analyze the latest results" },
  ],
  documents: [
    { name: "Show file structure", prompt: "Show the structure of my files" },
    { name: "Create a new folder", prompt: "Create a new folder" },
    { name: "Upload a file", prompt: "Upload a file" },
    {
      name: "Organize files into folders",
      prompt: "Organize my files into folders",
    },
    { name: "Find files by topic", prompt: "Find files by topic" },
    { name: "Find large files", prompt: "Find my largest files" },
    {
      name: "Find possible duplicates",
      prompt: "Find possible duplicate files",
    },
    {
      name: "Suggest files to clean up",
      prompt: "Suggest files I can clean up",
    },
  ],
  sharedWithMe: [
    {
      name: "Show files shared with me",
      prompt: "Show the files shared with me",
    },
    { name: "What needs my attention", prompt: "What needs my attention?" },
    { name: "Find files from a person", prompt: "Find files from a person" },
    { name: "Copy to my files", prompt: "Copy this to my files" },
  ],
  recent: [
    { name: "Summarize recent files", prompt: "Summarize my recent files" },
    {
      name: "Find recent files by topic",
      prompt: "Find recent files by topic",
    },
    { name: "Organize recent files", prompt: "Organize my recent files" },
  ],
  favorites: [
    { name: "Summarize favorites", prompt: "Summarize my favorite files" },
    {
      name: "Find information in favorites",
      prompt: "Find information in my favorites",
    },
    { name: "Compare favorite files", prompt: "Compare my favorite files" },
    {
      name: "Copy favorites to a folder",
      prompt: "Copy favorites to a folder",
    },
  ],
  trash: [
    { name: "Show items in Trash", prompt: "Show the items in Trash" },
    { name: "Find a deleted file", prompt: "Find a deleted file" },
    { name: "Restore selected items", prompt: "Restore the selected items" },
    {
      name: "What can be deleted permanently",
      prompt: "What can be deleted permanently?",
    },
    { name: "Empty Trash", prompt: "Empty the Trash" },
  ],
  archive: [
    { name: "Summarize archive", prompt: "Summarize the archived rooms" },
  ],
  rooms: [
    { name: "Summarize rooms", prompt: "Summarize my rooms" },
    { name: "Find a room", prompt: "Help me find a room" },
  ],
  default: [
    { name: "Summarize", prompt: "Summarize this document" },
    { name: "Find action items", prompt: "List the action items" },
    { name: "Improve writing", prompt: "Improve the writing of this document" },
  ],
};

// Map a folder type to a section, or `undefined` if it isn't a section root.
const sectionFromFolderType = (
  folderType?: FolderType | null,
): SuggestionSection | undefined => {
  switch (folderType) {
    case FolderType.USER:
      return "documents";
    case FolderType.SHARE:
      return "sharedWithMe";
    case FolderType.Recent:
      return "recent";
    case FolderType.Favorites:
      return "favorites";
    case FolderType.TRASH:
      return "trash";
    case FolderType.Archive:
      return "archive";
    case FolderType.Rooms:
      return "rooms";
    default:
      return undefined;
  }
};

// Map a room type to a section, or `undefined` if it isn't a known room type.
const sectionFromRoomType = (
  roomType?: RoomsType | null,
): SuggestionSection | undefined => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return "formRoom";
    case RoomsType.EditingRoom:
      return "editingRoom";
    case RoomsType.CustomRoom:
      return "customRoom";
    case RoomsType.PublicRoom:
      return "publicRoom";
    case RoomsType.VirtualDataRoom:
      return "virtualDataRoom";
    case RoomsType.AIRoom:
      return "aiRoom";
    default:
      return undefined;
  }
};

export type SuggestionContext = {
  roomType?: RoomsType | null;
  folderType?: FolderType | null;
  rootFolderType?: FolderType | null;
  isRoom?: boolean;
  isFolder?: boolean;
  isRootFolder?: boolean;
};

// Map the host's current context to a suggestion section.
//
// `isRoom` / `isFolder` disambiguate the context: inside a room the room type
// picks the section; in a folder the folder type picks it. `isRootFolder`
// chooses which folder signal leads: at the section root the current folder's
// `folderType` is authoritative, while in a nested subfolder (whose own type is
// usually `DEFAULT`) `rootFolderType` identifies the section. Whichever leads,
// the other is tried as a fallback. Falls back to `default` when nothing
// matches.
export const resolveSuggestionSection = ({
  roomType,
  folderType,
  rootFolderType,
  isRoom,
  isFolder,
  isRootFolder,
}: SuggestionContext): SuggestionSection => {
  if (isRoom) {
    return sectionFromRoomType(roomType) ?? "default";
  }

  if (isFolder) {
    const [leading, fallback] = isRootFolder
      ? [folderType, rootFolderType]
      : [rootFolderType, folderType];

    return (
      sectionFromFolderType(leading) ??
      sectionFromFolderType(fallback) ??
      "default"
    );
  }

  return "default";
};

// Build the ready-made suggestion chips for the current section. Passed to
// `AiAgentProviders` via the `suggestions` prop.
export const getSuggestions = (context: SuggestionContext): Suggestion[] =>
  SUGGESTIONS_BY_SECTION[resolveSuggestionSection(context)];
