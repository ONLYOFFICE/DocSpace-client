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

import {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
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
    return t("Common:SelectFromPortal", {
      productName: t("Common:ProductName"),
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
  if (isCopy)
    return security && "CopyTo" in security
      ? !security?.CopyTo || !security?.Create
      : !security?.Copy;
  if (isMove || isRestoreAll || isRestore)
    return security && "MoveTo" in security
      ? !security?.MoveTo || !security?.Create
      : !security?.Move;

  return false;
};
