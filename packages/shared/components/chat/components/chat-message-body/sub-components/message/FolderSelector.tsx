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
} from "../../../../../../api/files/types";
import { TRoomSecurity } from "../../../../../../api/rooms/types";

import {
  ApplyFilterOption,
  FolderType,
  DeviceType,
} from "../../../../../../enums";

import FilesSelectorComponent from "../../../../../../selectors/Files";
import { TBreadCrumb } from "../../../../../selector/Selector.types";
import { Portal } from "../../../../../portal";

import { useMessageStore } from "../../../../store/messageStore";

import { TGetIcon } from "../../../../types";

export type FolderSelectorProps = {
  showSelector: boolean;
  toggleSelector: () => void;
  getIcon: TGetIcon;
  currentDeviceType: DeviceType;
  message: string;
};
const disabledItems: Array<string | number> = [];

const FolderSelector = ({
  showSelector,
  toggleSelector,
  getIcon,
  currentDeviceType,
  message,
}: FolderSelectorProps) => {
  const { aiSelectedFolder, saveMessageToFile } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  const root = document.getElementById("root");

  const initFileName = message.substring(0, 20).replace(".", "");

  const onSubmit = React.useCallback(
    (
      selectedItemId: string | number | undefined,
      folderTitle: string,
      isPublic: boolean,
      breadCrumbs: TBreadCrumb[],
      fileName: string,
    ) => {
      toggleSelector();

      if (selectedItemId) saveMessageToFile(message, fileName, selectedItemId);
    },
    [toggleSelector, saveMessageToFile, message],
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
    ) => {
      if (isFirstLoad) return true;
      if (!selectedItemSecurity) return true;

      if ("Create" in selectedItemSecurity && selectedItemSecurity.Create)
        return false;

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
          withHeader
          headerProps={{
            headerLabel: t("Common:SaveButton"),
            onCloseClick: toggleSelector,
            isCloseable: true,
          }}
          getIcon={getIcon}
          withCancelButton
          cancelButtonLabel={t("Common:CancelButton")}
          submitButtonLabel={t("Common:SaveHereButton")}
          onCancel={toggleSelector}
          filesSettings={{} as TFilesSettings}
          withBreadCrumbs
          currentFolderId={aiSelectedFolder}
          withoutBackButton={false}
          withSearch
          isRoomsOnly={false}
          isThirdParty={false}
          withFooterCheckbox={false}
          withFooterInput
          disabledItems={disabledItems}
          rootFolderType={FolderType.Rooms}
          footerCheckboxLabel={t("Common:OpenSavedDocument")}
          footerInputHeader={t("Common:FileName")}
          currentFooterInputValue={initFileName}
          onSubmit={onSubmit}
          withCreate
          currentDeviceType={currentDeviceType}
          descriptionText=""
          getFilesArchiveError={() => ""}
          applyFilterOption={ApplyFilterOption.All}
        />
      }
    />
  );
};

export default observer(FolderSelector);
