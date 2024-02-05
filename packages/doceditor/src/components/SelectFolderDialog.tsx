"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import FilesSelector from "@docspace/shared/selectors/Files";
import { DeviceType } from "@docspace/shared/enums";

import { SelectFolderDialogProps } from "@/types";

const SelectFolderDialog = ({
  socketHelper,
  onSubmit,
  onClose,
  isVisible,
  titleSelectorFolder,
  fileInfo,
}: SelectFolderDialogProps) => {
  const { t } = useTranslation(["Common", "Editor"]);

  return (
    <FilesSelector
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      disabledItems={[]}
      footerInputHeader={t("Editor:FileName")}
      currentFooterInputValue={titleSelectorFolder}
      footerCheckboxLabel={t("Editor:OpenSavedDocument")}
      isPanelVisible={isVisible}
      onClose={onClose}
      onCloseAction={onClose}
      onAccept={onSubmit}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      withHeader
      headerLabel={t("Common:SaveButton")}
      searchPlaceholder={t("Common:Search")}
      emptyScreenDescription=""
      emptyScreenHeader=""
      embedded={false}
      acceptButtonLabel={t("Common:SaveHereButton")}
      cancelButtonLabel={t("Common:CancelButton")}
      searchEmptyScreenDescription=""
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      withFooterInput
      withCancelButton
      withFooterCheckbox={fileInfo.fileExst !== "fb2"}
      descriptionText={t("Common:SelectDOCXFormat")}
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={() => false}
      acceptButtonId="select-file-modal-submit"
      cancelButtonId="select-file-modal-cancel"
    />
  );
};

export default SelectFolderDialog;
