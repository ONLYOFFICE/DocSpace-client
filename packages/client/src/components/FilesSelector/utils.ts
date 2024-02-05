import { TTranslation } from "@docspace/shared/types";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

export const getHeaderLabel = (
  t: TTranslation,
  isEditorDialog: boolean,
  isCopy?: boolean,
  isRestoreAll?: boolean,
  isMove?: boolean,
  isSelect?: boolean,
  filterParam?: string,
  isRestore?: boolean,
) => {
  if (isRestore) return t("Common:RestoreTo");
  if (isMove) return t("Common:MoveTo");
  if (isCopy && !isEditorDialog) return t("Common:Copy");
  if (isRestoreAll) return t("Common:Restore");
  if (isSelect) {
    return filterParam ? t("Common:SelectFile") : t("Common:SelectAction");
  }

  if (filterParam === FilesSelectorFilterTypes.DOCX)
    return t("Translations:CreateMasterFormFromFile");
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
) => {
  if (isRestore) return t("Common:RestoreHere");
  if (isMove) return t("Translations:MoveHere");
  if (isCopy && !isEditorDialog) return t("Translations:CopyHere");
  if (isRestoreAll) return t("Common:RestoreHere");
  if (isSelect) return t("Common:SelectAction");

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
) => {
  if (isFirstLoad) return true;
  if (isRequestRunning) return true;
  if (filterParam) return !isFileSelected;
  if (sameId && !isCopy) return true;
  if (sameId && isCopy && includeFolder) return true;
  if (isRooms) return true;
  if (isRoot) return true;
  if (isSelectedParentFolder) return true;

  if (!security) return false;
  if (isCopy) return "CopyTo" in security ? !security?.CopyTo : !security.Copy;
  if (isMove || isRestoreAll || isRestore)
    return "MoveTo" in security ? !security?.MoveTo : !security.Move;

  return false;
};
