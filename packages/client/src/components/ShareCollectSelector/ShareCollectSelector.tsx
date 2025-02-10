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
import { inject, observer } from "mobx-react";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { RoomsType } from "@docspace/shared/enums";
import FilesSelectorWrapper from "@docspace/shared/selectors/Files";

import { toastr } from "@docspace/shared/components/toast";
import { useSelectorInfoBar } from "@docspace/shared/hooks/useSelectorInfoBar";

import type {
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import type { TData } from "@docspace/shared/components/toast/Toast.type";
import type {
  TBreadCrumb,
  TInfoBarData,
} from "@docspace/shared/components/selector/Selector.types";

import type {
  InjectShareCollectSelectorProps,
  ShareCollectSelectorProps,
} from "./ShareCollectSelector.types";

const ShareCollectSelector = inject<TStore>(
  ({
    settingsStore,
    filesSettingsStore,
    dialogsStore,
    filesActionsStore,
    uploadDataStore,
    infoPanelStore,
    filesStore,
  }) => {
    const { currentDeviceType } = settingsStore;
    const { setShareCollectSelector, conflictResolveDialogVisible } =
      dialogsStore;
    const { checkFileConflicts, setConflictDialogData, openFileAction } =
      filesActionsStore;
    const { itemOperationToFolder, clearActiveOperations } = uploadDataStore;
    const { setIsMobileHidden } = infoPanelStore;

    const { setSelected } = filesStore;

    const { getIcon } = filesSettingsStore;
    return {
      currentDeviceType,
      conflictResolveDialogVisible,
      getIcon,
      setShareCollectSelector,
      checkFileConflicts,
      setConflictDialogData,
      itemOperationToFolder,
      clearActiveOperations,
      setIsMobileHidden,
      setSelected,
      openFileAction,
    };
  },
)(
  observer(
    ({
      file,
      visible,
      currentDeviceType,
      conflictResolveDialogVisible,
      getIcon,
      setShareCollectSelector,
      checkFileConflicts,
      setConflictDialogData,
      clearActiveOperations,
      itemOperationToFolder,
      setIsMobileHidden,
      setSelected,
      openFileAction,
    }: ShareCollectSelectorProps & InjectShareCollectSelectorProps) => {
      const { t } = useTranslation(["Common", "Editor"]);
      const [withInfoBar, onCloseInfoBar] = useSelectorInfoBar();

      const requestRunning = React.useRef(false);

      const setIsRequestRunning = (arg: boolean) => {
        requestRunning.current = arg;
      };

      const onClose = () => {
        if (requestRunning.current) return;

        setShareCollectSelector(false);
      };

      const onCloseAction = () => {
        setIsMobileHidden(false);

        onClose();
      };

      const onCloseAndDeselectAction = () => {
        setSelected("none");
        onCloseAction();
      };

      const onSubmit = async (
        selectedItemId: string | number | undefined,
        folderTitle: string,
        isPublic: boolean,
        breadCrumbs: TBreadCrumb[],
        fileName: string,
        isChecked: boolean,
        selectedTreeNode: TFolder,
        // selectedFileInfo: TSelectedFileInfo,
      ) => {
        const fileIds = [file.id];
        const folderIds: number[] = [];

        const selectedFolder = { ...selectedTreeNode, isFolder: true };

        const operationData = {
          destFolderId: selectedItemId,
          folderIds,
          fileIds,
          deleteAfter: false,
          isCopy: true,
          folderTitle,
          translations: {
            copy: t("Common:CopyOperation"),
          },
          selectedFolder,
          fromShareCollectSelector: true,
        };

        setIsRequestRunning(true);

        try {
          const conflicts = (await checkFileConflicts(
            selectedItemId,
            folderIds,
            fileIds,
          )) as [];

          if (conflicts.length) {
            setConflictDialogData(conflicts, operationData);
            setIsRequestRunning(false);
          } else {
            setIsRequestRunning(false);
            onCloseAndDeselectAction();

            openFileAction(selectedFolder, t);
            await itemOperationToFolder(operationData);
          }
        } catch (e: unknown) {
          toastr.error(e as TData);
          setIsRequestRunning(false);
          clearActiveOperations(fileIds, folderIds);
        }
      };

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

      const getFilesArchiveError = React.useCallback(
        (name: string) => t("Common:ArchivedRoomAction", { name }),
        [t],
      );

      const getIconUrl = (size: number, fileExst: string) => {
        return getIcon(size, fileExst) ?? "";
      };

      const infoBarData: TInfoBarData = {
        title: t("Common:SelectorInfoBarTitle"),
        description: t("Common:SelectorInfoBarDescription"),
        icon: InfoIcon,
        onClose: onCloseInfoBar,
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
          isPanelVisible={visible ? !conflictResolveDialogVisible : null}
          currentDeviceType={currentDeviceType}
          headerLabel={t("Common:ShareAndCollect")}
          createDefineRoomLabel={t("Common:CreateFormFillingRoom")}
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
          withInfoBar={withInfoBar}
          infoBarData={infoBarData}
        />
      );
    },
  ),
) as unknown as React.FC<ShareCollectSelectorProps>;

export default ShareCollectSelector;
