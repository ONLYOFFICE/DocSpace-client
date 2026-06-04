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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useRouter, usePathname } from "next/navigation";
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
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import WarningComponent from "@docspace/ui-kit/components/navigation/sub-components/WarningComponent";

import { SectionWrapper } from "@/app/(docspace)/_components/section";
import Header from "@/app/(docspace)/_components/header";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";
import useDeviceType from "@/hooks/useDeviceType";
import { Filter } from "@/app/(docspace)/_components/filter";
import SelectionArea from "@/app/(docspace)/_components/selection-area";
import FilesMediaViewer from "@/app/(docspace)/_components/FilesMediaViewer";
import { DeviceTypeObserver } from "@/app/(docspace)/_components/DeviceTypeObserver";
import Dialogs from "@/app/(docspace)/_components/dialogs";
import RootScrollbar from "@/app/(docspace)/_components/RootScrollbar";
import List from "@/app/(docspace)/(files)/_components/list";
import { OpenFileContext } from "@/app/(docspace)/_contexts/OpenFileContext";
import { ShareContext } from "@/app/(docspace)/_contexts/ShareContext";
import { CopyShareLinkContext } from "@/app/(docspace)/_contexts/CopyShareLinkContext";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import { InfoContext } from "@/app/(docspace)/_contexts/InfoContext";
import { DeleteContext } from "@/app/(docspace)/_contexts/DeleteContext";
import { FileOperationsContext } from "@/app/(docspace)/_contexts/FileOperationsContext";
import { RenameContext } from "@/app/(docspace)/_contexts/RenameContext";
import { VersionHistoryContext } from "@/app/(docspace)/_contexts/VersionHistoryContext";
import { ConvertContext } from "@/app/(docspace)/_contexts/ConvertContext";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

import CreateFileDialog from "../create-file-dialog";
import DocsMainButton from "../main-button";
import ConvertDialog from "../convert-dialog";
import VersionHistoryPanel from "../version-history-panel";
import { useVersionHistoryStore } from "../../_store/VersionHistoryStore";
import {
  InfoPanelView,
  useInfoPanelStore,
} from "@/app/(docspace)/_store/InfoPanelStore";
import useDocsActions from "../../_hooks/useDocsActions";
import { useDocsMenuModels } from "../../_hooks/useDocsMenuModels";
import useTrashActions from "../../_hooks/useTrashActions";
import useFileOperations from "../../_hooks/useFileOperations";
import useRenameActions from "../../_hooks/useRenameActions";
import useConvertActions from "../../_hooks/useConvertActions";
import { useDocsSettingsStore } from "../../_store/DocsSettingsStore";
import { useDocsUserStore } from "../../_store/DocsUserStore";
import type { SelectorMode } from "../../_hooks/useFileOperations";
import { useDocsFrameBridge } from "../../_hooks/useDocsFrameBridge";
import DropZone from "../drop-zone";
import ConflictResolveDialog from "../conflict-resolve-dialog";
import DeleteDialog from "../delete-dialog";
import RenameDialog from "../rename-dialog";
import UploadPanel from "../upload-panel";
import ShareSelector from "../share-selector";
import useDocsHotkeys from "../../_hooks/useDocsHotkeys";
import useDragActions from "../../_hooks/useDragActions";
import { useDragStore } from "../../_store/DragStore";
import { DragContext } from "@/app/(docspace)/_contexts/DragContext";
import DragTooltip from "../drag-tooltip";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";
import {
  InfoPanelBody as DocsInfoPanelBody,
  InfoPanelHeader as DocsInfoPanelHeader,
  InfoPanelEditLinkDialog,
} from "@/app/(docspace)/_components/info-panel";

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
  /**
   * Temporary flag: hide "Add to favorites" in file/folder context menus.
   * Used for rooms internals and trash.
   */
  withoutFavorite?: boolean;
  /**
   * Base path used to navigate to the editor route. Defaults to
   * "/personal-files/editor". When provided (e.g., "/editor" for rooms), the
   * current pathname is appended as a `returnTo` query parameter so the editor
   * page can navigate back to the originating section.
   */
  editorBasePath?: string;
};

const getSubmitLabel = (mode: SelectorMode, t: (key: string) => string) => {
  if (mode === "copy") return t("Common:CopyHere");
  if (mode === "move") return t("Common:MoveHere");
  return t("Common:RestoreHere");
};

const DocsLayout = observer(
  ({
    folders,
    files,
    total,
    current,
    pathParts,
    filesSettings,
    portalSettings,
    filesFilter,
    withoutFavorite,
    editorBasePath,
  }: DocsLayoutProps) => {
    const { t } = useTranslation(["Common"]);
    const { isEmptyList } = useSettingsStore();
    const { rootFolderType } = useFilesListStore();
    const infoPanelStore = useInfoPanelStore();
    const versionHistoryStore = useVersionHistoryStore();
    const docsUserStore = useDocsUserStore();
    const { sdkConfig } = useSDKConfig();
    const router = useRouter();
    const pathname = usePathname();

    const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();
    const { currentDeviceType } = useDeviceType();
    const isMobile = currentDeviceType === DeviceType.mobile;

    const isMyDocuments = rootFolderType === FolderType.USER;
    const isInRooms =
      rootFolderType === FolderType.Rooms ||
      rootFolderType === FolderType.Archive;
    const isCanCreate = !!current.security?.Create;
    const isActionButtonEnabled =
      (isMyDocuments || isInRooms) &&
      !sdkConfig?.disableActionButton &&
      isCanCreate;

    const docsActions = useDocsActions({ editorBasePath });
    const {
      uploadFilesToFolder,
      openCreateDialog,
      closeCreateDialog,
      onSaveCreate,
      dialogVisible,
      dialogType,
      isCreating,
      onUploadFiles,
      onUploadFolder,
      uploadConflictDialogVisible,
      uploadConflictItems,
      confirmUploadConflict,
      closeUploadConflictDialog,
    } = docsActions;

    const { desktopModel, quickActionItems } = useDocsMenuModels({
      openCreateDialog,
      onUploadFiles,
      onUploadFolder,
    });

    useDocsFrameBridge({ isReady: true, uploadFilesToFolder });

    const uploadStore = useUploadStore();

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
      trackOperation,
      requestCopy,
      requestCopyItems,
      requestMove,
      requestMoveItems,
      requestRestore,
      requestRestoreItems,
      requestDuplicate,
      closeSelectorDialog,
      confirmOperation,
      conflictDialogVisible,
      conflictItems,
      closeConflictDialog,
      confirmConflict,
    } = useFileOperations();

    const {
      isTrash,
      requestDeleteItem,
      requestDelete,
      deleteDialogVisible,
      deleteDialogItemCount,
      isDeleting,
      closeDeleteDialog,
      confirmDelete,
      requestEmptyTrash,
      emptyTrashDialogVisible,
      isEmptyingTrash,
      closeEmptyTrashDialog,
      confirmEmptyTrash,
    } = useTrashActions(trackOperation);

    const deleteHandler = React.useMemo(
      () => ({
        deleteItem: requestDeleteItem,
        deleteItems: requestDelete,
        emptyTrash: requestEmptyTrash,
      }),
      [requestDeleteItem, requestDelete, requestEmptyTrash],
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

    const openFileInEditor = React.useCallback(
      (file: TFileItem, preview?: boolean) => {
        const basePath = editorBasePath ?? "/personal-files/editor";
        const params = new URLSearchParams();
        if (preview) params.set("action", "view");
        if (editorBasePath && pathname) {
          params.set("returnTo", pathname);
        }
        const qs = params.toString();
        const url = qs
          ? `${basePath}/${file.id}?${qs}`
          : `${basePath}/${file.id}`;

        const openInSameTab =
          sdkConfig?.openEditorInSameTab ?? filesSettings.openEditorInSameTab;
        if (!openInSameTab) {
          window.open(`${window.location.origin}/sdk${url}`, "_blank");
          return;
        }
        router.push(url);
      },
      [
        router,
        editorBasePath,
        pathname,
        filesSettings.openEditorInSameTab,
        sdkConfig?.openEditorInSameTab,
      ],
    );

    const {
      convertDialogVisible,
      convertTarget,
      isConverting,
      convertProgress,
      requestConvert,
      closeConvertDialog,
      confirmConvert,
      onChangeStoreOriginal,
    } = useConvertActions();

    const { onItemMouseDown } = useDragActions({ trackOperation });
    const dragStore = useDragStore();

    const dragContextValue: React.ContextType<typeof DragContext> = {
      onItemMouseDown,
      isDragging: dragStore.dragging || dragStore.osDragging,
      onFilesDroppedToFolder: (files, folderId) =>
        uploadFilesToFolder(files, folderId),
      onFilesDroppedToCurrentFolder: (files) => uploadFilesToFolder(files),
      // Hovered sub-folder overrides the current-folder default in the
      // "Drop to" label; clearing it falls back to the current folder.
      onFolderDragOver: dragStore.setOsHoveredFolderTitle,
      onFolderDragLeave: () => dragStore.setOsHoveredFolderTitle(null),
    };

    const docsSettingsStore = useDocsSettingsStore();
    const storeOriginalFiles =
      docsSettingsStore.filesSettings?.storeOriginalFiles ?? false;

    const openFileHandler = React.useCallback(
      (file: TFileItem, preview?: boolean) => {
        if (!preview && file.viewAccessibility?.MustConvert) {
          requestConvert(file);
          return;
        }
        openFileInEditor(file, preview);
      },
      [openFileInEditor, requestConvert],
    );
    const shareHandler = React.useCallback(
      (item: TFileItem | TFolderItem) => {
        infoPanelStore.open(item);
        infoPanelStore.setView(InfoPanelView.infoShare);
      },
      [infoPanelStore],
    );

    const copyShareLinkHandler = React.useCallback(
      async (item: TFileItem | TFolderItem) => {
        const primaryLink = await ShareLinkService.getPrimaryLink(item);
        if (primaryLink) {
          copyShareLink(item, primaryLink, t);
          infoPanelStore.setShareChanged(true);
        }
      },
      [t, infoPanelStore],
    );

    const infoHandler = React.useCallback(
      (item: TFileItem | TFolderItem) => {
        infoPanelStore.open(item);
        infoPanelStore.setView(InfoPanelView.infoDetails);
      },
      [infoPanelStore],
    );

    const versionHistoryHandler = React.useCallback(
      (item: TFileItem) => {
        versionHistoryStore.open(item as TFile);
      },
      [versionHistoryStore],
    );

    useDocsHotkeys({
      onOpenFile: (item) => {
        if (!item.isFolder) openFileHandler(item as TFileItem);
      },
      onRenameItem: requestRename,
      onDeleteItems: requestDelete,
      onCreateFile: openCreateDialog,
      onUploadFiles,
      onUploadFolder,
    });

    return (
      <DragContext.Provider value={dragContextValue}>
      <OpenFileContext.Provider value={openFileHandler}>
        <InfoContext.Provider value={infoHandler}>
          <ShareContext.Provider value={shareHandler}>
            <CopyShareLinkContext.Provider value={copyShareLinkHandler}>
              <DeleteContext.Provider value={deleteHandler}>
                <RenameContext.Provider value={renameHandler}>
                  <FileOperationsContext.Provider value={fileOperationsHandler}>
                    <VersionHistoryContext.Provider
                      value={versionHistoryHandler}
                    >
                      <ConvertContext.Provider value={requestConvert}>
                        <div className={styles.root} style={frameHeaderVars}>
                          <DropZone
                            onFilesDropped={uploadFilesToFolder}
                            disabled={!isMyDocuments}
                            currentFolderTitle={current.title}
                            canCreate={isCanCreate}
                          >
                            <RootScrollbar>
                              <SectionWrapper
                                sectionHeaderContent={
                                  <Header
                                    current={current}
                                    pathParts={pathParts}
                                    isEmptyList={isEmptyList}
                                    isInfoPanelVisible={
                                      infoPanelStore.isVisible
                                    }
                                    onToggleInfoPanel={infoPanelStore.toggle}
                                    headerOffset={headerOffset}
                                  />
                                }
                                stickyTableHeader
                                scrollableBanner={isActionButtonEnabled}
                                sectionBannerContent={
                                  isActionButtonEnabled ? (
                                    <QuickActions
                                      items={quickActionItems}
                                      className={styles.quickActions}
                                    />
                                  ) : undefined
                                }
                                sectionWarningContent={
                                  isTrash ? (
                                    <WarningComponent
                                      title={t(
                                        "Common:TrashAutoDeleteWarning",
                                        {
                                          sectionName: t("Common:TrashSection"),
                                        },
                                      )}
                                    />
                                  ) : undefined
                                }
                                sectionFilterContent={
                                  <Filter
                                    filesFilter={filesFilter}
                                    showMainButton={
                                      isActionButtonEnabled && !isMobile
                                    }
                                    mainButtonProps={
                                      isActionButtonEnabled && !isMobile
                                        ? {
                                            isDropdown: true,
                                            model: desktopModel,
                                            text: t("Common:New"),
                                          }
                                        : undefined
                                    }
                                  />
                                }
                                sectionBodyContent={
                                  <List
                                    total={total}
                                    folders={folders}
                                    files={files}
                                    filesSettings={filesSettings}
                                    portalSettings={portalSettings}
                                    filesFilter={filesFilter}
                                    current={current}
                                    currentUserId={docsUserStore.user?.id}
                                    infoPanelVisible={infoPanelStore.isVisible}
                                  />
                                }
                                infoPanelHeaderContent={<DocsInfoPanelHeader />}
                                infoPanelBodyContent={<DocsInfoPanelBody />}
                                isInfoPanelVisible={infoPanelStore.isVisible}
                                setIsInfoPanelVisible={(v: boolean) => {
                                  if (v) {
                                    if (!infoPanelStore.isVisible) {
                                      infoPanelStore.toggle();
                                    }
                                  } else {
                                    infoPanelStore.close();
                                  }
                                }}
                                isEmptyPage={isEmptyList}
                                filesFilter={filesFilter}
                              />
                              <SelectionArea />
                              <FilesMediaViewer filesSettings={filesSettings} />
                              <DeviceTypeObserver />
                              <Dialogs />
                            </RootScrollbar>
                          </DropZone>
                          {isActionButtonEnabled && isMobile ? (
                            <DocsMainButton
                              mode="mobile"
                              actions={docsActions}
                            />
                          ) : null}
                          <InfoPanelEditLinkDialog />
                          <ShareSelector />
                          <VersionHistoryPanel />
                          <CreateFileDialog
                            visible={dialogVisible}
                            type={dialogType}
                            isCreating={isCreating}
                            onClose={closeCreateDialog}
                            onSave={onSaveCreate}
                          />
                          <DeleteDialog
                            visible={deleteDialogVisible}
                            isLoading={isDeleting}
                            itemCount={deleteDialogItemCount}
                            isTrash={isTrash}
                            onClose={closeDeleteDialog}
                            onConfirm={confirmDelete}
                          />
                          <DeleteDialog
                            visible={emptyTrashDialogVisible}
                            isLoading={isEmptyingTrash}
                            itemCount={0}
                            isTrash
                            isEmptyTrash
                            onClose={closeEmptyTrashDialog}
                            onConfirm={confirmEmptyTrash}
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
                                (foldersTree ??
                                  []) as unknown as FolderDtoInteger[]
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
                              initSelectedItemId={
                                selectorInitData.currentFolderId
                              }
                              initSearchValue={null}
                              initTotal={selectorInitData.total}
                              initHasNextPage={selectorInitData.hasNextPage}
                              submitButtonLabel={getSubmitLabel(
                                selectorMode,
                                t,
                              )}
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
                                _selectedItemId: string | number | undefined,
                                _selectedItemType:
                                  | "rooms"
                                  | "files"
                                  | "agents"
                                  | undefined,
                                isRoot: boolean,
                              ) => isFirstLoad || isRoot}
                              onCancel={closeSelectorDialog}
                              onSubmit={(
                                selectedItemId: string | number | undefined,
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
                          {uploadStore.hasItems && (
                            <FloatingButton
                              icon="upload"
                              percent={uploadStore.percent}
                              completed={
                                uploadStore.uploaded &&
                                uploadStore.errorsCount === 0
                              }
                              alert={uploadStore.errorsCount > 0}
                              onClick={() => uploadStore.setPanelVisible(true)}
                            />
                          )}
                          {convertProgress && (
                            <FloatingButton
                              icon="refresh"
                              percent={convertProgress.percent}
                              completed={convertProgress.completed}
                              alert={convertProgress.alert}
                            />
                          )}
                          <UploadPanel />
                          <RenameDialog
                            visible={renameDialogVisible}
                            initialName={renameInitialName}
                            isRenaming={isRenaming}
                            onClose={closeRenameDialog}
                            onSave={confirmRename}
                          />
                          <ConflictResolveDialog
                            visible={
                              conflictDialogVisible ||
                              uploadConflictDialogVisible
                            }
                            conflictItems={
                              conflictDialogVisible
                                ? conflictItems
                                : uploadConflictItems
                            }
                            onClose={
                              conflictDialogVisible
                                ? closeConflictDialog
                                : closeUploadConflictDialog
                            }
                            onSubmit={
                              conflictDialogVisible
                                ? confirmConflict
                                : confirmUploadConflict
                            }
                          />
                          <ConvertDialog
                            visible={convertDialogVisible}
                            fileExst={convertTarget?.fileExst ?? ""}
                            storeOriginalFiles={storeOriginalFiles}
                            isConverting={isConverting}
                            onChangeStoreOriginal={onChangeStoreOriginal}
                            onClose={closeConvertDialog}
                            onConfirm={confirmConvert}
                          />
                          <DragTooltip />
                        </div>
                      </ConvertContext.Provider>
                    </VersionHistoryContext.Provider>
                  </FileOperationsContext.Provider>
                </RenameContext.Provider>
              </DeleteContext.Provider>
            </CopyShareLinkContext.Provider>
          </ShareContext.Provider>
        </InfoContext.Provider>
      </OpenFileContext.Provider>
      </DragContext.Provider>
    );
  },
);

export default DocsLayout;

