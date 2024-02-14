"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files/FilesSelector.wrapper";
import { DeviceType } from "@docspace/shared/enums";

import { SelectFolderDialogProps } from "@/types";
import { TSelectorCancelButton } from "@docspace/shared/components/selector/Selector.types";
import { useTheme } from "styled-components";

const SelectFolderDialog = ({
  socketHelper,
  onSubmit,
  onClose,
  isVisible,
  titleSelectorFolder,
  fileInfo,
  getIsDisabled,
}: SelectFolderDialogProps) => {
  const { t, i18n } = useTranslation(["Common", "Editor"]);

  const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const cancelButtonProps: TSelectorCancelButton = {
    withCancelButton: true,
    onCancel: onClose,
    cancelButtonLabel: t("CancelButton"),
    cancelButtonId: "select-file-modal-cancel",
  };

  const theme = useTheme();

  return (
    <FilesSelectorWrapper
      theme={theme}
      i18nProp={i18n}
      {...cancelButtonProps}
      withHeader
      withBreadCrumbs
      withSearch
      withoutBackButton
      withCancelButton
      headerLabel={t("SaveButton")}
      disabledItems={[]}
      onSubmit={onSubmit}
      submitButtonLabel={t("SaveHereButton")}
      submitButtonId="select-file-modal-submit"
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      footerInputHeader={t("Editor:FileName")}
      currentFooterInputValue={titleSelectorFolder}
      footerCheckboxLabel={t("Editor:OpenSavedDocument")}
      isPanelVisible={isVisible}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={sessionPath || fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      embedded={false}
      withFooterInput
      withFooterCheckbox={fileInfo.fileExst !== "fb2"}
      descriptionText=""
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
    />
  );
};

export default SelectFolderDialog;
