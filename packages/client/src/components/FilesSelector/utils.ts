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

import { FilesSelectorFilterTypes, RoomsType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

export const getHeaderLabel = (
  t: TTranslation,
  isEditorDialog: boolean,
  isCopy?: boolean,
  isRestoreAll?: boolean,
  isMove?: boolean,
  isSelect?: boolean,
  filterParam?: string,
  isRestore?: boolean,
  isFormRoom?: boolean,
  isThirdParty?: boolean,
  isSelectFolder?: boolean,
) => {
  if (isRestore) return t("Common:RestoreTo");
  if (isSelectFolder) return t("Common:SelectFolder");
  if (isMove) return t("Common:MoveTo");
  if (isCopy && !isEditorDialog) return t("Common:Copy");
  if (isRestoreAll) return t("Common:Restore");
  if (isSelect) {
    return filterParam ? t("Common:SelectFile") : t("Common:SelectAction");
  }

  if (isFormRoom) {
    return t("Common:SelectFromPortal");
  }

  if (filterParam === FilesSelectorFilterTypes.DOCX)
    return t("Common:CreateMasterFormFromFile");
  if (filterParam) return t("Common:SelectFile");

  return t("Common:SaveButton");
};

export const getAcceptButtonLabel = (
  t: TTranslation,
  isEditorDialog: boolean,
  isCopy?: boolean,
  isRestoreAll?: boolean,
  isMove?: boolean,
  isSelect?: boolean,
  filterParam?: string,
  isRestore?: boolean,
  isFormRoom?: boolean,
  isSelectFolder?: boolean,
) => {
  if (isRestore) return t("Common:RestoreHere");
  if (isMove) return t("Common:MoveHere");
  if (isCopy && !isEditorDialog) return t("Common:CopyHere");
  if (isRestoreAll) return t("Common:RestoreHere");
  if (isSelect || isFormRoom || isSelectFolder) return t("Common:SelectAction");

  if (filterParam === FilesSelectorFilterTypes.DOCX) return t("Common:Create");
  // if (filterParam === FilesSelectorFilterTypes.DOCXF) return t("Common:SubmitToGallery");
  if (filterParam) return t("Common:SaveButton");

  return t("Common:SaveHereButton");
};

const ORDINARY_TARGET_ROOM_TYPES = [
  RoomsType.EditingRoom,
  RoomsType.CustomRoom,
  RoomsType.PublicRoom,
  RoomsType.VirtualDataRoom,
];

/**
 * The room types the copy and move selector lists in its Rooms section.
 * Besides the ordinary rooms, an Instructions room is offered when every
 * selected item is a Markdown file, and a Knowledge room when every selected
 * item is a file vectorization reads (and vectorization is on); folders
 * disqualify both, since neither room holds any.
 */
export const getCopyTargetRoomTypes = (
  selection: { isFolder?: boolean; fileExst?: string | null }[],
  extsFilesVectorized: string[],
  vectorizationEnabled: boolean,
): RoomsType[] => {
  const types = [...ORDINARY_TARGET_ROOM_TYPES];
  if (selection.length === 0) return types;

  const exts: string[] = [];
  for (const item of selection) {
    if (item.isFolder || !item.fileExst) return types;
    exts.push(item.fileExst.toLowerCase());
  }

  if (exts.every((ext) => ext === ".md")) types.push(RoomsType.InstructionsRoom);

  const vectorized = extsFilesVectorized.map((ext) => ext.toLowerCase());
  if (vectorizationEnabled && exts.every((ext) => vectorized.includes(ext)))
    types.push(RoomsType.KnowledgeRoom);

  return types;
};

/**
 * Which room sections the selector lists. A caller that names them keeps its
 * choice; otherwise they follow the apps, as the sidebar does: a section
 * switched off in Settings -> Apps is not offered, so nothing can be moved,
 * copied or restored into a room - or a new room - nobody can open.
 */
export const getRoomSectionTreeFolders = (
  isInstalled: (id: string) => boolean,
  {
    withRoomsTreeFolder,
    withFormsTreeFolder,
  }: { withRoomsTreeFolder?: boolean; withFormsTreeFolder?: boolean },
) => ({
  withRoomsTreeFolder: withRoomsTreeFolder ?? isInstalled("ai-rooms"),
  withFormsTreeFolder: withFormsTreeFolder ?? isInstalled("ai-forms"),
});

/**
 * Whether the selector lists the Private section. Only a Copy out of a
 * private room can land in another private room: a transfer into one from
 * outside is refused, and a Move stays in its room. Not while the section is
 * not available.
 * Spec: private-rooms/file-operations, "Copy into another private room needs access to it"
 */
export const offersPrivateSection = ({
  isCopy,
  sourceInPrivateRoom,
  isPrivateRoomsSectionAvailable,
}: {
  isCopy?: boolean;
  sourceInPrivateRoom?: boolean;
  isPrivateRoomsSectionAvailable?: boolean;
}) => !!isCopy && !!sourceInPrivateRoom && !!isPrivateRoomsSectionAvailable;
