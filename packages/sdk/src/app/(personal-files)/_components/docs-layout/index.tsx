"use client";

// (c) Copyright Ascensio System SIA 2009-2026
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
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TPathParts } from "@docspace/shared/types";
import { FolderType, DeviceType } from "@docspace/shared/enums";
import FilesSelector from "@docspace/ui-kit/selectors/Files";
import type {
  FilesSelectorProps,
  FolderDtoInteger,
  TSelectedFileInfo,
  FileEntryDtoIntegerAllOfSecurity,
} from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import { FloatingButton } from "@docspace/ui-kit/components/floating-button";

import { SectionWrapper } from "@/app/(docspace)/_components/section";
import Header from "@/app/(docspace)/_components/header";
import useDeviceType from "@/hooks/useDeviceType";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";
import { Filter } from "@/app/(docspace)/_components/filter";
import SelectionArea from "@/app/(docspace)/_components/selection-area";
import FilesMediaViewer from "@/app/(docspace)/_components/FilesMediaViewer";
import { DeviceTypeObserver } from "@/app/(docspace)/_components/DeviceTypeObserver";
import Dialogs from "@/app/(docspace)/_components/dialogs";
import RootScrollbar from "@/app/(docspace)/_components/RootScrollbar";
import List from "@/app/(docspace)/(files)/_components/list";
import { OpenFileContext } from "@/app/(docspace)/_contexts/OpenFileContext";
import { ShareContext } from "@/app/(docspace)/_contexts/ShareContext";
import { DeleteContext } from "@/app/(docspace)/_contexts/DeleteContext";
import { FileOperationsContext } from "@/app/(docspace)/_contexts/FileOperationsContext";
import { RenameContext } from "@/app/(docspace)/_contexts/RenameContext";
import type { TFileItem, TFolderItem } from "@/app/(docspace)/_hooks/useItemList";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { SidebarProvider, useSidebar } from "../../_contexts/SidebarContext";
import DocsMainButton from "../main-button";
import { useInfoPanelStore } from "../../_store/InfoPanelStore";
import useDocsActions from "../../_hooks/useDocsActions";
import useTrashActions from "../../_hooks/useTrashActions";
import useFileOperations from "../../_hooks/useFileOperations";
import useRenameActions from "../../_hooks/useRenameActions";
import type { SelectorMode } from "../../_hooks/useFileOperations";
import { useDocsFrameBridge } from "../../_hooks/useDocsFrameBridge";
import DocsSidebar from "../sidebar";
import DropZone from "../drop-zone";
import DeleteDialog from "../delete-dialog";
import RenameDialog from "../rename-dialog";
import DocsInfoPanel from "../info-panel";

import styles from "./DocsLayout.module.scss";

type DocsLayoutProps = {
  folders: TFolder[];
  files: TFile[];
  total: number;
  current: TFolder;
  pathParts: TPathParts[];
  filesSettings: TFilesSettings;
  portalSettings: TSettings;
  filesFilter: string;
};

const getSubmitLabel = (mode: SelectorMode, t: (key: string) => string) => {
  if (mode === "copy") return t("Common:CopyHere");
  if (mode === "move") return t("Common:MoveHere");
  return t("Common:RestoreHere");
};

const DocsLayoutInner = observer(({
  folders,
  files,
  total,
  current,
  pathParts,
  filesSettings,
  portalSettings,
  filesFilter,
}: DocsLayoutProps) => {
  const { t } = useTranslation(["Common"]);
  const { isEmptyList } = useSettingsStore();
  const { rootFolderType } = useFilesListStore();
  const { currentDeviceType } = useSidebar();
  const infoPanelStore = useInfoPanelStore();
  const { sdkConfig } = useSDKConfig();
  const router = useRouter();

  const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();

  const isMyDocuments = rootFolderType === FolderType.USER;
  const showMobileButton = currentDeviceType !== DeviceType.desktop && isMyDocuments;

  const { uploadFilesToFolder } = useDocsActions();

  useDocsFrameBridge({ isReady: true, uploadFilesToFolder });
  const {
    isTrash,
    requestDeleteItem,
    requestDelete,
    deleteDialogVisible,
    deleteDialogItemCount,
    isDeleting,
    closeDeleteDialog,
    confirmDelete,
  } = useTrashActions();

  const {
    renameDialogVisible,
    renameInitialName,
    isRenaming,
    requestRename,
    closeRenameDialog,
    confirmRename,
  } = useRenameActions();

  const {
    selectorDialogVisible,
    selectorMode,
    foldersTree,
    selectorInitData,
    disabledItems,
    operationProgress,
    requestCopy,
    requestCopyItems,
    requestMove,
    requestMoveItems,
    requestRestore,
    requestRestoreItems,
    requestDuplicate,
    closeSelectorDialog,
    confirmOperation,
  } = useFileOperations();

  const deleteHandler = React.useMemo(
    () => ({ deleteItem: requestDeleteItem, deleteItems: requestDelete }),
    [requestDeleteItem, requestDelete],
  );

  const renameHandler = React.useMemo(
    () => ({ renameItem: requestRename }),
    [requestRename],
  );

  const fileOperationsHandler = React.useMemo(
    () => ({
      copyItem: requestCopy,
      moveItem: requestMove,
      duplicateItem: requestDuplicate,
      restoreItem: requestRestore,
      copyItems: requestCopyItems,
      moveItems: requestMoveItems,
      restoreItems: requestRestoreItems,
    }),
    [
      requestCopy,
      requestCopyItems,
      requestMove,
      requestMoveItems,
      requestDuplicate,
      requestRestore,
      requestRestoreItems,
    ],
  );

  const openFileHandler = React.useCallback(
    (file: TFileItem, preview?: boolean) => {
      const url = preview
        ? `/personal-files/editor/${file.id}?action=view`
        : `/personal-files/editor/${file.id}`;
      router.push(url);
    },
    [router],
  );

  const shareHandler = React.useCallback(
    (item: TFileItem | TFolderItem) => {
      infoPanelStore.open(item);
    },
    [infoPanelStore],
  );

  return (
    <OpenFileContext.Provider value={openFileHandler}>
      <ShareContext.Provider value={shareHandler}>
        <DeleteContext.Provider value={deleteHandler}>
        <RenameContext.Provider value={renameHandler}>
        <FileOperationsContext.Provider value={fileOperationsHandler}>
        <div className={styles.root} style={frameHeaderVars}>
          {sdkConfig?.showMenu !== false && <DocsSidebar />}
          <DropZone onFilesDropped={uploadFilesToFolder} disabled={!isMyDocuments}>
            <RootScrollbar>
              <SectionWrapper
                sectionHeaderContent={
                  <Header
                    current={current}
                    pathParts={pathParts}
                    isEmptyList={isEmptyList}
                    isInfoPanelVisible={sdkConfig?.infoPanelVisible ? infoPanelStore.isVisible : false}
                    onToggleInfoPanel={sdkConfig?.infoPanelVisible ? infoPanelStore.toggle : undefined}
                    headerOffset={headerOffset}
                  />
                }
                sectionFilterContent={<Filter filesFilter={filesFilter} />}
                sectionBodyContent={
                  <List
                    total={total}
                    folders={folders}
                    files={files}
                    filesSettings={filesSettings}
                    portalSettings={portalSettings}
                    filesFilter={filesFilter}
                    current={current}
                  />
                }
                isEmptyPage={isEmptyList}
                filesFilter={filesFilter}
              />
              <SelectionArea />
              <FilesMediaViewer filesSettings={filesSettings} />
              <DeviceTypeObserver />
              <Dialogs />
            </RootScrollbar>
          </DropZone>
          <DocsInfoPanel />
          {showMobileButton && <DocsMainButton mode="mobile" isDisabled={sdkConfig?.disableActionButton} />}
          <DeleteDialog
            visible={deleteDialogVisible}
            isLoading={isDeleting}
            itemCount={deleteDialogItemCount}
            isTrash={isTrash}
            onClose={closeDeleteDialog}
            onConfirm={confirmDelete}
          />
          {selectorDialogVisible && selectorInitData && (
            <FilesSelector
              isPanelVisible={selectorDialogVisible}
              embedded={false}
              currentDeviceType={DeviceType.desktop}
              currentFolderId={selectorInitData.currentFolderId}
              rootFolderType={
                selectorInitData.rootFolderType as unknown as Parameters<
                  typeof FilesSelector
                >[0]["rootFolderType"]
              }
              treeFolders={
                (foldersTree ?? []) as unknown as FolderDtoInteger[]
              }
              filesSettings={
                filesSettings as unknown as NonNullable<
                  FilesSelectorProps["filesSettings"]
                >
              }
              isUserOnly={selectorMode !== "restore"}
              isRoomsOnly={false}
              isThirdParty={false}
              openRoot={selectorMode === "restore"}
              withInit
              initItems={
                selectorInitData.items as unknown as FolderDtoInteger[]
              }
              initBreadCrumbs={selectorInitData.breadCrumbs}
              initSelectedItemType="files"
              initSelectedItemId={selectorInitData.currentFolderId}
              initSearchValue={null}
              initTotal={selectorInitData.total}
              initHasNextPage={selectorInitData.hasNextPage}
              submitButtonLabel={getSubmitLabel(selectorMode, t)}
              cancelButtonLabel={t("Common:CancelButton")}
              withCancelButton
              withBreadCrumbs
              withSearch
              withCreate={false}
              withFooterInput={false}
              withFooterCheckbox={false}
              withoutBackButton
              footerInputHeader=""
              currentFooterInputValue=""
              footerCheckboxLabel=""
              descriptionText=""
              disabledItems={disabledItems}
              getFilesArchiveError={() => ""}
              getIsDisabled={(
                isFirstLoad: boolean,
                _isSelectedParentFolder: boolean,
                _selectedItemId:
                  | string
                  | number
                  | undefined,
                _selectedItemType:
                  | "rooms"
                  | "files"
                  | "agents"
                  | undefined,
                isRoot: boolean,
              ) => isFirstLoad || isRoot}
              onCancel={closeSelectorDialog}
              onSubmit={(
                selectedItemId:
                  | string
                  | number
                  | undefined,
              ) => {
                if (selectedItemId !== undefined) {
                  confirmOperation(selectedItemId as number);
                }
              }}
            />
          )}
          {operationProgress && (
            <FloatingButton
              icon={operationProgress.icon}
              percent={operationProgress.percent}
              completed={operationProgress.completed}
              alert={operationProgress.alert}
            />
          )}
          <RenameDialog
            visible={renameDialogVisible}
            initialName={renameInitialName}
            isRenaming={isRenaming}
            onClose={closeRenameDialog}
            onSave={confirmRename}
          />
        </div>
        </FileOperationsContext.Provider>
        </RenameContext.Provider>
        </DeleteContext.Provider>
      </ShareContext.Provider>
    </OpenFileContext.Provider>
  );
});

const DocsLayout = (props: DocsLayoutProps) => {
  const { currentDeviceType } = useDeviceType();

  return (
    <SidebarProvider currentDeviceType={currentDeviceType}>
      <DocsLayoutInner {...props} />
    </SidebarProvider>
  );
};

export default DocsLayout;
