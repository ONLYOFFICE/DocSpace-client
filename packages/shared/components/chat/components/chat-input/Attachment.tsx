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
import { useTranslation } from "react-i18next";

import { DeviceType, FolderType } from "../../../../enums";
import { isDesktop, isTablet } from "../../../../utils";

import { TFile } from "../../../../api/files/types";

import FilesSelector from "../../../../selectors/Files";

import { TSelectorItem } from "../../../selector";

import { AttachmentProps } from "../../Chat.types";
import { CHAT_SUPPORTED_FORMATS } from "../../Chat.constants";

const Attachment = ({
  isVisible,
  toggleAttachment,
  getIcon,
  setSelectedFiles,
}: AttachmentProps) => {
  const { t } = useTranslation(["Common"]);

  const [tempSelectedFiles, setTempSelectedFiles] = React.useState<
    Partial<TFile>[]
  >([]);

  const onSelectItem = (item: TSelectorItem) => {
    if (!item.id || !item.fileExst) return;

    if (tempSelectedFiles.some((file) => file.id === item.id)) {
      setTempSelectedFiles((prev) =>
        prev.filter((file) => file.id !== item.id),
      );
      return;
    }

    setTempSelectedFiles((prev) => [
      ...prev,
      { id: Number(item.id), title: item.label, fileExst: item.fileExst },
    ]);
  };

  if (!isVisible) return null;

  return (
    <FilesSelector
      isPanelVisible={isVisible}
      onCancel={toggleAttachment}
      openRoot
      getIcon={getIcon}
      getIsDisabled={(
        isFirstLoad,
        isSelectedParentFolder,
        selectedItemId,
        selectedItemType,
        isRoot,
        selectedItemSecurity,
        selectedFileInfo,
      ) => {
        if (!selectedItemSecurity?.Read) return true;

        if (!selectedFileInfo) return true;

        return false;
      }}
      onSubmit={() => {
        setSelectedFiles(tempSelectedFiles);
        setTempSelectedFiles([]);
        toggleAttachment();
      }}
      onSelectItem={onSelectItem}
      withHeader
      headerProps={{
        headerLabel: t("Common:SelectFile"),
        isCloseable: true,
        onCloseClick: toggleAttachment,
      }}
      withSearch
      withBreadCrumbs
      withoutBackButton
      withCancelButton
      withCreate={false}
      withFooterCheckbox={false}
      withFooterInput={false}
      cancelButtonLabel={t("Common:CancelButton")}
      submitButtonLabel={t("Common:AddButton")}
      disabledItems={[]}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId=""
      rootFolderType={FolderType.Rooms}
      footerCheckboxLabel=""
      footerInputHeader=""
      currentFooterInputValue=""
      descriptionText=""
      getFilesArchiveError={() => ""}
      filterParam={CHAT_SUPPORTED_FORMATS}
      isMultiSelect
      withRecentTreeFolder
      currentDeviceType={
        isDesktop()
          ? DeviceType.desktop
          : isTablet()
            ? DeviceType.tablet
            : DeviceType.mobile
      }
    />
  );
};

export default Attachment;
