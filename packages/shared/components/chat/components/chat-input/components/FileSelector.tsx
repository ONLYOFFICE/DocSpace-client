import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  TFileSecurity,
  TFilesSettings,
  TFolderSecurity,
} from "../../../../../api/files/types";
import { TRoomSecurity } from "../../../../../api/rooms/types";

import { TSelectorItem } from "../../../../selector/Selector.types";

import {
  ApplyFilterOption,
  DeviceType,
  FilterType,
  FolderType,
} from "../../../../../enums";

import FilesSelectorComponent from "../../../../../selectors/Files";
import { TSelectedFileInfo } from "../../../../../selectors/Files/FilesSelector.types";

import { Portal } from "../../../../portal";

import { useFilesStore } from "../../../store/filesStore";

type FilesSelectorProps = {
  showSelector: boolean;
  toggleSelector: () => void;

  currentDeviceType: DeviceType;
};

const disabledItems: Array<string | number> = [];

const FilesSelector = ({
  showSelector,
  toggleSelector,

  currentDeviceType,
}: FilesSelectorProps) => {
  const { setFiles } = useFilesStore();

  const { t } = useTranslation(["Common"]);

  const [items, setItems] = React.useState<TSelectorItem[]>([]);

  const root = document.getElementById("root");

  const onSelect = React.useCallback((item: TSelectorItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }

      return [...prev, item];
    });
  }, []);

  const onSubmit = React.useCallback(() => {
    setFiles(items);
    setItems([]);
    toggleSelector();
  }, [toggleSelector, setFiles, items]);

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
      if (items.length === 0) return true;
      if (isFirstLoad) return true;
      if (selectedFileInfo) return false;

      return true;
    },
    [items.length],
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
            headerLabel: t("Common:Select"),
            onCloseClick: toggleSelector,
            isCloseable: true,
          }}
          withCancelButton
          cancelButtonLabel={t("Common:CancelButton")}
          submitButtonLabel={t("Common:Select")}
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
          isMultiSelect
          onSelectItem={onSelect}
        />
      }
    />
  );
};

export default observer(FilesSelector);
