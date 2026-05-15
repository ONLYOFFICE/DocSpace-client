/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import isNil from "lodash/isNil";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { RoomsType } from "@docspace/shared/enums";
import FilesSelectorWrapper from "@docspace/ui-kit/selectors/Files";

import { toastr } from "@docspace/ui-kit/components/toast";
import { useSelectorInfoBar } from "@docspace/shared/hooks/useSelectorInfoBar";

import type {
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type {
  TSelectedFileInfo,
  SdkFolderType,
} from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import type { TData } from "@docspace/ui-kit/components/toast";
import type {
  TBreadCrumb,
  TInfoBarData,
} from "@docspace/ui-kit/components/selector";
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
    contextOptionsStore,
  }) => {
    const { currentDeviceType } = settingsStore;
    const { conflictResolveDialogVisible, setAssignRolesDialogData } =
      dialogsStore;
    const { checkFileConflicts, setConflictDialogData, openFileAction } =
      filesActionsStore;
    const { itemOperationToFolder, clearActiveOperations } = uploadDataStore;
    const { setIsMobileHidden } = infoPanelStore;

    const { setSelected } = filesStore;

    const { getIcon } = filesSettingsStore;

    const { startFillingInFormRoom } = contextOptionsStore;

    return {
      currentDeviceType,
      conflictResolveDialogVisible,
      getIcon,
      checkFileConflicts,
      setConflictDialogData,
      itemOperationToFolder,
      clearActiveOperations,
      setIsMobileHidden,
      setSelected,
      openFileAction,
      setAssignRolesDialogData,
      startFillingInFormRoom,
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
      checkFileConflicts,
      setConflictDialogData,
      clearActiveOperations,
      itemOperationToFolder,
      setIsMobileHidden,
      setSelected,
      openFileAction,
      createDefineRoomType,
      headerProps = {},
      onCloseActionProp,
      onCancel,
      setAssignRolesDialogData,
      startFillingInFormRoom,
    }: ShareCollectSelectorProps & InjectShareCollectSelectorProps) => {
      const { t } = useTranslation(["Common"]);
      const [withInfoBar, onCloseInfoBar] = useSelectorInfoBar();

      const requestRunning = React.useRef(false);

      const setIsRequestRunning = (arg: boolean) => {
        requestRunning.current = arg;
      };

      const onClose = () => {
        if (onCloseActionProp) {
          onCloseActionProp();
        }
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
          destFolderInfo: selectedTreeNode,
          title: file.title,
          isFolder: file.isFolder,
          itemsCount: 1,
          folderIds,
          fileIds,
          deleteAfter: false,
          isCopy: true,
          folderTitle,
          selectedFolder,
          fromShareCollectSelector: true,
          createDefineRoomType,
          toFillOut: createDefineRoomType === RoomsType.VirtualDataRoom,
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
            return;
          }

          setIsRequestRunning(false);
          onCloseAndDeselectAction();

          openFileAction(selectedFolder, t);

          const result = await itemOperationToFolder(operationData).catch(
            (error) => {
              console.error(error);
            },
          );

          const hasFile =
            result && !isNil(result.files) && result.files.length === 1;

          if (!hasFile) return;

          const [resultFile] = result.files ?? [];

          switch (createDefineRoomType) {
            case RoomsType.FormRoom:
              await startFillingInFormRoom(resultFile);
              break;
            case RoomsType.VirtualDataRoom:
              setAssignRolesDialogData(
                true,
                selectedTreeNode.title,
                resultFile,
              );
              break;
            default:
              console.error("Unhandled room type");
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
        selectedItemType: "rooms" | "files" | "agents" | undefined,
        isRoot: boolean,
        selectedItemSecurity:
          | TFolderSecurity
          | TRoomSecurity
          | TFileSecurity
          | undefined,
        selectedFileInfo: TSelectedFileInfo,
        isDisabledFolder?: boolean,
        isInsideKnowledge?: boolean,
        isInsideResultStorage?: boolean,
      ): boolean => {
        if (selectedItemType === "rooms" || isRoot) return true;
        if (selectedItemType === "agents" || isInsideResultStorage) return true;

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
        description:
          createDefineRoomType === RoomsType.FormRoom
            ? t("Common:SelectorInfoBarDescription")
            : t("Common:SelectorInfoBarOfVDRDescription"),
        icon: InfoIcon,
        onClose: onCloseInfoBar,
      };

      const createDefineRoomLabels: Partial<Record<RoomsType, string>> = {
        [RoomsType.VirtualDataRoom]: t("Common:CreateVirtualDataRoom"),
        [RoomsType.FormRoom]: t("Common:CreateFormFillingRoom"),
      };

      return (
        <FilesSelectorWrapper
          withCreate
          withHeader
          withSearch
          isRoomsOnly
          withBreadCrumbs
          withoutBackButton={false}
          withCancelButton
          currentFolderId=""
          headerProps={{
            headerLabel: t("Common:ShareAndCollect"),
            onCloseClick: onClose,
            ...headerProps,
          }}
          rootFolderType={file.rootFolderType as unknown as SdkFolderType}
          createDefineRoomType={createDefineRoomType}
          isPanelVisible={visible ? !conflictResolveDialogVisible : false}
          currentDeviceType={currentDeviceType}
          createDefineRoomLabel={
            createDefineRoomLabels[createDefineRoomType] ?? ""
          }
          submitButtonLabel={t("Common:CopyHere")}
          cancelButtonLabel={t("Common:CancelButton")}
          cancelButtonId="share-collect-selector-cancel"
          onCancel={onCancel}
          onSubmit={
            onSubmit as unknown as Parameters<
              typeof FilesSelectorWrapper
            >[0]["onSubmit"]
          }
          getIsDisabled={
            getIsDisabled as unknown as Parameters<
              typeof FilesSelectorWrapper
            >[0]["getIsDisabled"]
          }
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
