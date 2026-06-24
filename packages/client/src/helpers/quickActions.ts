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

// Shared classification of the current Home section for the "quick actions"
// banner (ported from the SDK). Used by both the section layout (to decide
// which set of action tiles to render) and the section header (to hide the
// redundant `+` button across the whole Files/Rooms experience). Keeping the
// logic in one place guarantees the layout and the header always agree.

export type QuickActionsSection =
  // Personal files ("My documents") or a regular (non-private) room: offer the
  // four file-creation tiles (document / spreadsheet / presentation / PDF).
  | "files"
  // Rooms list root: offer the create-room tile (+ disabled use-template tile).
  | "rooms"
  // Forms section root: offer the collect-forms tile + from-template tile.
  | "forms"
  // Encrypted/private room: the SDK shows folder + upload tiles here, but the
  // matching illustrations are not bundled in the client package, so we render
  // no banner for now (the `+` button is still hidden — see isFilesRoomsArea).
  | "private"
  // Archive / trash / templates / favorites / recent / AI-agents / contacts /
  // profile / settings: no quick-actions banner.
  | null;

export type SectionFlags = {
  // Folder-type getters from TreeFoldersStore (current selected folder).
  isDocumentsFolder?: boolean; // rootFolderType === USER ("My documents" tree)
  isRoom?: boolean; // anywhere inside the Rooms tree
  isRoomsFolder?: boolean; // exactly the rooms list root
  isPrivacyFolder?: boolean; // inside an encrypted/private room
  isArchiveFolder?: boolean;
  isRecycleBinFolder?: boolean;
  isTemplatesFolder?: boolean;
  isFavoritesFolder?: boolean;
  isRecentFolder?: boolean;
  isAIAgentsFolder?: boolean;
  // View-level flags (already computed in Home/Header).
  isFormsSection?: boolean; // the "Forms" section root (CategoryType.Forms)
  isContactsPage?: boolean;
  isProfile?: boolean;
  isSettingsPage?: boolean;
};

// Returns which quick-actions tile set (if any) applies to the current section.
export const getQuickActionsSection = (
  flags: SectionFlags,
): QuickActionsSection => {
  const {
    isDocumentsFolder,
    isRoom,
    isRoomsFolder,
    isPrivacyFolder,
    isArchiveFolder,
    isRecycleBinFolder,
    isTemplatesFolder,
    isFavoritesFolder,
    isRecentFolder,
    isAIAgentsFolder,
    isFormsSection,
    isContactsPage,
    isProfile,
    isSettingsPage,
  } = flags;

  // Never inside non-files areas or read-only / special folders.
  if (isContactsPage || isProfile || isSettingsPage) return null;
  if (
    isArchiveFolder ||
    isRecycleBinFolder ||
    isTemplatesFolder ||
    isFavoritesFolder ||
    isRecentFolder ||
    isAIAgentsFolder
  )
    return null;

  // Forms section root → collect-forms + from-template tiles.
  if (isFormsSection) return "forms";

  // Rooms list root → room tiles.
  if (isRoomsFolder) return "rooms";

  // Encrypted/private room → handled separately (no banner for now).
  if (isPrivacyFolder) return "private";

  // "My documents" tree or inside a regular room → file tiles.
  if (isDocumentsFolder || isRoom) return "files";

  return null;
};

// Whether the current section belongs to the Files/Rooms experience. The `+`
// header button is hidden across ALL of these (including archive / trash /
// templates / favorites / recent), per product decision — the quick-actions
// tiles replace creation there.
export const isFilesRoomsArea = (flags: SectionFlags): boolean => {
  const { isContactsPage, isProfile, isSettingsPage, isAIAgentsFolder } = flags;

  if (isContactsPage || isProfile || isSettingsPage) return false;
  // AI-agents keeps its own dedicated create button.
  if (isAIAgentsFolder) return false;

  return true;
};
