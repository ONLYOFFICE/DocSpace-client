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

import {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { getBrandName } from "@docspace/shared/constants/brands";

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
    return t("Common:SelectFromPortal", {
      productName: getBrandName("ProductName"),
    });
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

export const getIsDisabled = (
  isFirstLoad: boolean,
  isSelectedParentFolder: boolean,
  sameId?: boolean,
  isRooms?: boolean,
  isRoot?: boolean,
  isCopy?: boolean,
  isMove?: boolean,
  isRestoreAll?: boolean,
  isRequestRunning?: boolean,
  security?: TFileSecurity | TFolderSecurity | TRoomSecurity,
  filterParam?: string,
  isFileSelected?: boolean,
  includeFolder?: boolean,
  isRestore?: boolean,
  isDisabledFolder?: boolean,
  isInsideKnowledge?: boolean,
  isInsideResultStorage?: boolean,
  isAgents?: boolean,
) => {
  if (isFirstLoad) return true;
  if (isRequestRunning) return true;
  if (isDisabledFolder) return true;
  if (filterParam) return !isFileSelected;
  if (sameId && !isCopy) return true;
  if (sameId && isCopy && includeFolder) return true;
  if (isRooms) return true;
  if (isRoot) return true;
  if (isSelectedParentFolder) return true;
  if (isCopy) {
    if (isInsideResultStorage || isAgents) return true;

    return security && "CopyTo" in security
      ? !security?.CopyTo || !security?.Create
      : !security?.Copy;
  }
  if (isMove || isRestoreAll || isRestore) {
    if (isInsideResultStorage || isAgents) return true;

    return security && "MoveTo" in security
      ? !security?.MoveTo || !security?.Create
      : !security?.Move;
  }

  return false;
};
