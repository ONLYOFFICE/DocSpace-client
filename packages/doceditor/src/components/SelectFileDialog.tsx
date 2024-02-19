import React from "react";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files/FilesSelector.wrapper";

import { DeviceType, FilesSelectorFilterTypes } from "@docspace/shared/enums";

import { SelectFileDialogProps } from "@/types";

const SelectFileDialog = ({
  socketHelper,
  fileTypeDetection,
  getIsDisabled,
  isVisible,
  onClose,
  onSubmit,
  fileInfo,
  t,
  i18n,
}: SelectFileDialogProps) => {
  const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const headerLabel = fileTypeDetection.filterParam
    ? t?.("Common:SelectFile") ?? ""
    : t?.("Common:SelectAction") ?? "";

  const getFileTypeTranslation = React.useCallback(() => {
    switch (fileTypeDetection.filterParam) {
      case FilesSelectorFilterTypes.XLSX:
        return t?.("Editor:MailMergeFileType") ?? "";
      case FilesSelectorFilterTypes.IMG:
        return t?.("Editor:ImageFileType") ?? "";
      case FilesSelectorFilterTypes.DOCX:
        return t?.("Editor:DocumentsFileType") ?? "";
      default:
        return "";
    }
  }, [fileTypeDetection.filterParam, t]);

  const selectFilesListTitle = React.useCallback(() => {
    const type = getFileTypeTranslation();
    return fileTypeDetection.filterParam === FilesSelectorFilterTypes.XLSX
      ? type
      : t?.("Editor:SelectFilesType", { fileType: type }) ?? "";
  }, [fileTypeDetection.filterParam, getFileTypeTranslation, t]);

  const listTitle = selectFilesListTitle();

  return (
    <FilesSelectorWrapper
      i18nProp={i18n}
      withoutBackButton
      withSearch
      withBreadCrumbs
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      disabledItems={[]}
      isPanelVisible={isVisible}
      onCancel={onClose}
      onSubmit={onSubmit}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={sessionPath || fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      withHeader
      headerLabel={headerLabel}
      embedded={false}
      withFooterInput={false}
      withFooterCheckbox={false}
      footerCheckboxLabel=""
      footerInputHeader=""
      currentFooterInputValue=""
      submitButtonLabel={t?.("Common:SelectAction") ?? ""}
      cancelButtonLabel={t?.("Common:CancelButton") ?? ""}
      withCancelButton
      descriptionText={listTitle}
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
      submitButtonId="select-file-modal-submit"
      cancelButtonId="select-file-modal-cancel"
      {...fileTypeDetection}
    />
  );
};

export default SelectFileDialog;
