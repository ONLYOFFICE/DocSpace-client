// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  FilterType,
  FolderType,
} from "../../../../../enums";

import FilesSelectorComponent from "../../../../../selectors/Files";
import { TSelectedFileInfo } from "../../../../../selectors/Files/FilesSelector.types";

import { Portal } from "../../../../portal";

import { useFilesStore } from "../../../store/filesStore";
import { useMessageStore } from "../../../store/messageStore";

import { FilesSelectorProps } from "../ChatInput.types";

const disabledItems: Array<string | number> = [];

const FilesSelector = ({
  showSelector,
  toggleSelector,
  getIcon,
  currentDeviceType,
}: FilesSelectorProps) => {
  const { setFiles } = useFilesStore();
  const { aiSelectedFolder } = useMessageStore();

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
          filterParam={FilterType.FilesOnly}
          withHeader
          headerProps={{
            headerLabel: t("Common:Select"),
            onCloseClick: toggleSelector,
            isCloseable: true,
          }}
          getIcon={getIcon}
          withCancelButton
          cancelButtonLabel={t("Common:CancelButton")}
          submitButtonLabel={t("Common:Select")}
          onCancel={toggleSelector}
          filesSettings={{} as TFilesSettings}
          withBreadCrumbs={false}
          currentFolderId={aiSelectedFolder}
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
