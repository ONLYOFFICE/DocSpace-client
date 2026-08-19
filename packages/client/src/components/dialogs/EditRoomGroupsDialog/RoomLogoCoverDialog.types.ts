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

import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";
import { TTranslation } from "@docspace/shared/types";

import {
  ICover,
  ILogo,
  IUpdateRoomGroup,
  ICreateRoomGroup,
} from "./EditRoomGroupsDialog.types";

export interface CoverDialogProps {
  getCovers: () => void;
  covers: ICover[] | null;
  currentColorScheme: TColorScheme;
  arrIdsRooms: string[] | null;
  setIsOpenGroupIcon: (visible: boolean) => void;
  onCloseEditRoomGroupsDialog: () => void;
  setCreateGroupRooms: (newGroup: ICreateRoomGroup) => Promise<void>;
  getAllRoomGroups: () => Promise<void>;
  editingGroupId: string | null;
  setEditingGroupId: (id: string | null) => void;
  updateGroupIcon: (groupId: string, icon: string) => Promise<void>;
  updateRoomGroup: (groupId: string, data: IUpdateRoomGroup) => Promise<void>;
  currentGroupIcon: ILogo | string | null;
  currentGroupName: string | null;
  isOpenedFromContextMenu?: boolean;
}

export interface SelectIconProps {
  t: TTranslation;
  setIcon: (icon: ICover | string | null) => void;
  covers: ICover[] | null;
  $currentColorScheme: TColorScheme;
  coverId: string;
}
