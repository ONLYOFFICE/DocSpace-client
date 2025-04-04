import React from "react";
import { observer } from "mobx-react";

import {
  TFileSecurity,
  TFilesSettings,
  TFolder,
  TFolderSecurity,
} from "../../../../../api/files/types";
import { TRoomSecurity } from "../../../../../api/rooms/types";

import {
  ApplyFilterOption,
  DeviceType,
  FilterType,
  FolderType,
} from "../../../../../enums";

import FilesSelectorComponent from "../../../../../selectors/Files";
import { TSelectedFileInfo } from "../../../../../selectors/Files/FilesSelector.types";

import { Portal } from "../../../../portal";
import { TBreadCrumb } from "../../../../selector/Selector.types";

import { useFilesStore } from "../../../store/filesStore";

type FilesSelectorProps = {
  showSelector: boolean;
  toggleSelector: () => void;

  currentDeviceType: DeviceType;
};

const FilesSelector = ({
  showSelector,
  toggleSelector,

  currentDeviceType,
}: FilesSelectorProps) => {
  const { setFile } = useFilesStore();

  const root = document.getElementById("root");

  const disabledItems = React.useMemo(() => [], []);

  const onSubmit = React.useCallback(
    (
      selectedItemId: string | number | undefined,
      folderTitle: string,
      isPublic: boolean,
      breadCrumbs: TBreadCrumb[],
      fileName: string,
      isChecked: boolean,
      selectedTreeNode: TFolder,
      selectedFileInfo: TSelectedFileInfo,
    ) => {
      setFile(selectedFileInfo);

      toggleSelector();
    },
    [toggleSelector, setFile],
  );

  const getIsDisabled = React.useCallback(
    (
      isFirstLoad: boolean,
      isSelectedParentFolder: boolean,
      selectedItemId: string | number | undefined,
      selectedItemType: "rooms" | "files" | undefined,
      isRoot: boolean,
      selectedItemSecurity:
        | TFileSecurity
        | TFolderSecurity
        | TRoomSecurity
        | undefined,
      selectedFileInfo: TSelectedFileInfo,
    ) => {
      if (isFirstLoad) return true;
      if (selectedFileInfo) return false;

      return true;
    },
    [],
  );

  return (
    <Portal
      visible={showSelector}
      appendTo={root || undefined}
      element={
        <FilesSelectorComponent
          isPanelVisible={showSelector}
          getIsDisabled={getIsDisabled}
          filterParam={FilterType.DocumentsOnly}
          withHeader
          headerProps={{
            headerLabel: "Select",
            onCloseClick: toggleSelector,
            isCloseable: true,
          }}
          withCancelButton
          cancelButtonLabel="Cancel"
          submitButtonLabel="Select"
          onCancel={toggleSelector}
          filesSettings={{} as TFilesSettings}
          withBreadCrumbs={false}
          currentFolderId={35}
          withoutBackButton
          withSearch
          isRoomsOnly={false}
          isThirdParty={false}
          withFooterCheckbox={false}
          withFooterInput={false}
          disabledItems={disabledItems}
          rootFolderType={FolderType.Rooms}
          footerCheckboxLabel=""
          footerInputHeader=""
          currentFooterInputValue=""
          onSubmit={onSubmit}
          withCreate={false}
          currentDeviceType={currentDeviceType}
          descriptionText=""
          getFilesArchiveError={() => ""}
          applyFilterOption={ApplyFilterOption.All}
        />
      }
    />
  );
};

export default observer(FilesSelector);
