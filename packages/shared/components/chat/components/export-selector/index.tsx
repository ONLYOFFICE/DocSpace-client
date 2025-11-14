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

import { useTranslation } from "react-i18next";

import { DeviceType, FolderType } from "../../../../enums";
import { isDesktop, isTablet } from "../../../../utils";

import FilesSelector from "../../../../selectors/Files";
import { TGetIcon } from "../../../../selectors/utils/types";
import { TBreadCrumb } from "../../../selector/Selector.types";

type ExportSelectorProps = {
  showFolderSelector: boolean;
  onCloseFolderSelector: () => void;
  getIcon: TGetIcon;
  onSubmit: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
  ) => Promise<void>;
  roomId: string | number;
  getFileName: () => string;
};

const ExportSelector = ({
  showFolderSelector,
  onCloseFolderSelector,
  getIcon,
  onSubmit,
  roomId,
  getFileName,
}: ExportSelectorProps) => {
  const { t } = useTranslation(["Common"]);

  return (
    <FilesSelector
      isPanelVisible={showFolderSelector}
      onCancel={onCloseFolderSelector}
      getIcon={getIcon}
      getIsDisabled={(
        isFirstLoad,
        isSelectedParentFolder,
        selectedItemId,
        selectedItemType,
        isRoot,
        selectedItemSecurity,
      ) => {
        if (selectedItemType === "rooms" || selectedItemType === "agents")
          return true;

        if (
          selectedItemSecurity &&
          "Create" in selectedItemSecurity &&
          selectedItemSecurity.Create
        )
          return false;

        return true;
      }}
      onSubmit={onSubmit}
      withHeader
      headerProps={{
        headerLabel: t("Common:SaveButton"),
        isCloseable: true,
        onCloseClick: onCloseFolderSelector,
      }}
      withSearch
      withBreadCrumbs
      withoutBackButton
      withCancelButton
      withCreate={false}
      withFooterCheckbox
      withFooterInput
      cancelButtonLabel={t("Common:CancelButton")}
      submitButtonLabel={t("Common:SaveButton")}
      disabledItems={[]}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={roomId}
      rootFolderType={FolderType.Rooms}
      footerCheckboxLabel={t("Common:OpenSavedDocument")}
      footerInputHeader={t("Common:FileName")}
      currentFooterInputValue={getFileName()}
      descriptionText=""
      getFilesArchiveError={() => ""}
      withAIAgentsTreeFolder
      currentDeviceType={
        isDesktop()
          ? DeviceType.desktop
          : isTablet()
            ? DeviceType.tablet
            : DeviceType.mobile
      }
      renderInPortal
    />
  );
};

export default ExportSelector;
