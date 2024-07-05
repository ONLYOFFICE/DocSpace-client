// (c) Copyright Ascensio System SIA 2009-2024
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
import { inject, observer } from "mobx-react";

import { RoomsType } from "@docspace/shared/enums";
import FilesSelectorWrapper from "@docspace/shared/selectors/Files";

import type {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";

import type {
  InjectShareCollectSelectorProps,
  ShareCollectSelectorProps,
} from "./ShareCollectSelector.types";

const ShareCollectSelector = inject<TStore>(
  ({ settingsStore, filesSettingsStore, dialogsStore }) => {
    const { socketHelper, currentDeviceType } = settingsStore;
    const { setShareCollectSelector } = dialogsStore;

    const { getIcon } = filesSettingsStore;
    return {
      socketHelper,
      currentDeviceType,
      getIcon,
      setShareCollectSelector,
    };
  },
)(
  observer(
    ({
      file,
      visible,
      socketHelper,
      currentDeviceType,
      getIcon,
      setShareCollectSelector,
    }: ShareCollectSelectorProps & InjectShareCollectSelectorProps) => {
      const { t } = useTranslation(["Common", "Editor"]);

      const requestRunning = React.useRef(false);

      const headerLabel = "";

      const onSubmit = () => {};

      const getIsDisabled = (
        isFirstLoad: boolean,
        isSelectedParentFolder: boolean,
        selectedItemId: string | number | undefined,
        selectedItemType: "rooms" | "files" | undefined,
        isRoot: boolean,
        selectedItemSecurity:
          | TFolderSecurity
          | TRoomSecurity
          | TFileSecurity
          | undefined,
        selectedFileInfo: TSelectedFileInfo,
      ): boolean => {
        if (selectedItemType === "rooms" || isRoot) return true;

        if (isFirstLoad) return true;
        if (requestRunning.current) return true;
        if (selectedFileInfo) return true;

        if (!selectedItemSecurity) return false;

        return "CopyTo" in selectedItemSecurity
          ? !selectedItemSecurity?.CopyTo
          : !selectedItemSecurity.Copy;
      };

      const onClose = () => {
        setShareCollectSelector(false, null);
      };

      const getFilesArchiveError = React.useCallback(
        (name: string) => t("Common:ArchivedRoomAction", { name }),
        [t],
      );

      const getIconUrl = (size: number, fileExst: string) => {
        return getIcon(size, fileExst) ?? "";
      };

      return (
        <FilesSelectorWrapper
          withCreate
          withHeader
          withSearch
          isRoomsOnly
          withBreadCrumbs
          withoutBackButton
          withCancelButton
          currentFolderId=""
          rootFolderType={file.rootFolderType}
          createDefineRoomType={RoomsType.FormRoom}
          isPanelVisible={visible}
          socketHelper={socketHelper}
          socketSubscribers={socketHelper.socketSubscribers}
          currentDeviceType={currentDeviceType}
          headerLabel={t("Common:ShareAndCollect")}
          createDefineRoomLabel={t("Common:NewFillingFormRoom")}
          submitButtonLabel={t("Common:CopyHere")}
          cancelButtonLabel={t("Common:CancelButton")}
          cancelButtonId="share-collect-selector-cancel"
          onCancel={onClose}
          onSubmit={onSubmit}
          getIsDisabled={getIsDisabled}
          getFilesArchiveError={getFilesArchiveError}
          disabledItems={[]}
          descriptionText=""
          footerInputHeader=""
          footerCheckboxLabel=""
          currentFooterInputValue=""
          embedded={false}
          isThirdParty={false}
          withFooterCheckbox={false}
          withFooterInput={false}
          getIcon={getIconUrl}
        />
      );
    },
  ),
) as unknown as React.FC<ShareCollectSelectorProps>;

export default ShareCollectSelector;
