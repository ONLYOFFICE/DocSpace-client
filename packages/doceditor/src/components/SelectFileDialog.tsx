import React from "react";
import { useTranslation } from "react-i18next";

import FilesSelector from "@docspace/shared/selectors/Files";
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
}: SelectFileDialogProps) => {
  const { t } = useTranslation(["Common", "Editor"]);

  const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const headerLabel = fileTypeDetection.filterParam
    ? t("Common:SelectFile")
    : t("Common:SelectAction");

  const getFileTypeTranslation = React.useCallback(() => {
    switch (fileTypeDetection.filterParam) {
      case FilesSelectorFilterTypes.XLSX:
        return t("Editor:MailMergeFileType");
      case FilesSelectorFilterTypes.IMG:
        return t("Editor:ImageFileType");
      case FilesSelectorFilterTypes.DOCX:
        return t("Editor:DocumentsFileType");
      default:
        return "";
    }
  }, [fileTypeDetection.filterParam, t]);

  const selectFilesListTitle = React.useCallback(() => {
    const type = getFileTypeTranslation();
    return fileTypeDetection.filterParam === FilesSelectorFilterTypes.XLSX
      ? type
      : t("Editor:SelectFilesType", { fileType: type });
  }, [fileTypeDetection.filterParam, getFileTypeTranslation, t]);

  const listTitle = selectFilesListTitle();

  return (
    <FilesSelector
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      disabledItems={[]}
      isPanelVisible={isVisible}
      onClose={onClose}
      onCloseAction={onClose}
      onAccept={onSubmit}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={sessionPath || fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      withHeader
      headerLabel={headerLabel}
      searchPlaceholder={t("Common:Search")}
      emptyScreenDescription=""
      emptyScreenHeader=""
      embedded={false}
      withFooterInput={false}
      withFooterCheckbox={false}
      footerCheckboxLabel=""
      footerInputHeader=""
      currentFooterInputValue=""
      acceptButtonLabel={t("Common:SelectAction")}
      cancelButtonLabel={t("Common:CancelButton")}
      searchEmptyScreenDescription=""
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      withCancelButton
      descriptionText={listTitle}
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
      acceptButtonId="select-file-modal-submit"
      cancelButtonId="select-file-modal-cancel"
      {...fileTypeDetection}
    />
  );
};

export default SelectFileDialog;
