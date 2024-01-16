import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { BreadCrumb, Security } from "./FilesSelector.types";

export const PAGE_COUNT = 100;

export const defaultBreadCrumb: BreadCrumb = {
  label: "DocSpace",
  id: 0,
  isRoom: false,
};

export const SHOW_LOADER_TIMER = 500;
export const MIN_LOADER_TIMER = 500;

export const getHeaderLabel = (
  t: any,
  isCopy?: boolean,
  isRestoreAll?: boolean,
  isMove?: boolean,
  isSelect?: boolean,
  filterParam?: string,
  isRestore?: boolean
) => {
  if (isRestore) return t("Common:RestoreTo");
  if (isMove) return t("Common:MoveTo");
  if (isCopy) return t("Common:Copy");
  if (isRestoreAll) return t("Common:Restore");
  if (isSelect) {
    return filterParam ? t("Common:SelectFile") : t("Common:SelectAction");
  }

  if (filterParam === FilesSelectorFilterTypes.DOCX)
    return t("Translations:CreateMasterFormFromFile");
  if (!!filterParam) return t("Common:SelectFile");

  return t("Common:SaveButton");
};

export const getAcceptButtonLabel = (
  t: any,
  isCopy?: boolean,
  isRestoreAll?: boolean,
  isMove?: boolean,
  isSelect?: boolean,
  filterParam?: string,
  isRestore?: boolean
) => {
  if (isRestore) return t("Common:RestoreHere");
  if (isMove) return t("Translations:MoveHere");
  if (isCopy) return t("Translations:CopyHere");
  if (isRestoreAll) return t("Common:RestoreHere");
  if (isSelect) return t("Common:SelectAction");

  if (filterParam === FilesSelectorFilterTypes.DOCX) return t("Common:Create");
  // if (filterParam === FilesSelectorFilterTypes.DOCXF) return t("Common:SubmitToGallery");
  if (!!filterParam) return t("Common:SaveButton");

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
  security?: Security,
  filterParam?: string,
  isFileSelected?: boolean,
  includeFolder?: boolean,
  isRestore?: boolean
) => {
  if (isFirstLoad) return true;
  if (isRequestRunning) return true;
  if (!!filterParam) return !isFileSelected;
  if (sameId && !isCopy) return true;
  if (sameId && isCopy && includeFolder) return true;
  if (isRooms) return true;
  if (isRoot) return true;
  if (isSelectedParentFolder) return true;
  if (isCopy) return !security?.CopyTo;
  if (isMove || isRestoreAll || isRestore) return !security?.MoveTo;

  return false;
};
