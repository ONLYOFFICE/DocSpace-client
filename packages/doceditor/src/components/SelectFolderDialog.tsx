"use client";

import React from "react";

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
  return (
    <FilesSelector
      socketHelper={socketHelper}
      socketSubscribers={socketHelper.socketSubscribers}
      disabledItems={[]}
      // footerInputHeader={t("FileName")}
      footerInputHeader="FileName"
      currentFooterInputValue={titleSelectorFolder}
      // footerCheckboxLabel={t("OpenSavedDocument")}
      footerCheckboxLabel="OpenSavedDocument"
      isPanelVisible={isVisible}
      onClose={onClose}
      onCloseAction={onClose}
      onAccept={onSubmit}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={fileInfo.folderId}
      rootFolderType={fileInfo.rootFolderType}
      withHeader
      headerLabel="HeaderLabel"
      searchPlaceholder=""
      emptyScreenDescription=""
      emptyScreenHeader=""
      embedded={false}
      acceptButtonLabel=""
      cancelButtonLabel=""
      searchEmptyScreenDescription=""
      searchEmptyScreenHeader=""
      withFooterInput
      withCancelButton
      withFooterCheckbox
      descriptionText=""
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={() => false}
    />
  );
};

export default SelectFolderDialog;
