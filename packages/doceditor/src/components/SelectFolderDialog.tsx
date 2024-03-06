"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files/FilesSelector.wrapper";
import { DeviceType } from "@docspace/shared/enums";

import { SelectFolderDialogProps } from "@/types";
import { TSelectorCancelButton } from "@docspace/shared/components/selector/Selector.types";

const SelectFolderDialog = ({
  socketHelper,
  onSubmit,
  onClose,
  isVisible,
  titleSelectorFolder,
  fileInfo,
  getIsDisabled,
  filesSettings,
  i18n,
  fileSaveAsExtension,
}: SelectFolderDialogProps) => {
  const { t } = useTranslation();
  const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const cancelButtonProps: TSelectorCancelButton = {
    withCancelButton: true,
    onCancel: onClose,
    cancelButtonLabel: t?.("Common:CancelButton") ?? "",
    cancelButtonId: "select-file-modal-cancel",
  };

  const withFooterCheckbox =
    fileSaveAsExtension !== "zip" && fileInfo.fileExst !== "fb2";

  return (
    <FilesSelectorWrapper
      i18nProp={i18n}
      filesSettings={filesSettings}
      {...cancelButtonProps}
      withHeader
      withBreadCrumbs
      withSearch
      withoutBackButton
      withCancelButton
      headerLabel={i18n.t?.("Common:SaveButton") ?? ""}
      disabledItems={[]}
      onSubmit={onSubmit}
      submitButtonLabel={i18n.t?.("Common:SaveHereButton") ?? ""}
      submitButtonId="select-file-modal-submit"
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      footerInputHeader={i18n.t?.("Editor:FileName") ?? ""}
      currentFooterInputValue={titleSelectorFolder}
      footerCheckboxLabel={i18n.t?.("Editor:OpenSavedDocument") ?? ""}
      isPanelVisible={isVisible}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={sessionPath || fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      embedded={false}
      withFooterInput
      withFooterCheckbox={withFooterCheckbox}
      descriptionText=""
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
    />
  );
};

export default SelectFolderDialog;
