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
import { makeAutoObservable, runInAction } from "mobx";
import copy from "copy-to-clipboard";
import { isMobile } from "react-device-detect";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TTranslation } from "@docspace/shared/types";
import type {
  TFile,
  TFileLink,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import { copyShareLink as copyToBuffer } from "@docspace/shared/utils/copy";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import {
  connectedCloudsTypeTitleTranslation,
} from "SRC_DIR/helpers/filesUtils";
import { getOAuthToken } from "@docspace/ui-kit/utils/get-oauth-token";
import { OPERATIONS_NAME } from "@docspace/ui-kit/constants";
import {
  AnalyticsEvents,
  RoomsType,
  Events,
  FolderType,
  UrlActionType,
  FilesSelectorFilterTypes,
  FilterType,
  FileExtensions,
  FormFillingManageAction,
} from "@docspace/shared/enums";
import {
  formRoleMapping,
  getFileLink,
  getFolderLink,
  manageFormFilling,
  removeSharedFolderOrFile,
} from "@docspace/shared/api/files";
import { createLoader } from "@docspace/shared/utils/createLoader";
import { FILLING_STATUS_ID } from "@docspace/shared/constants";
import {
  isFile as isFileUtil,
  isFolder,
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import {
  XlsxUpdateService,
} from "@docspace/shared/services/xlsx-update.service";
import {
  showCreatedPDFFormDialog,
} from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import { PersistenceKeys, getPersisted } from "../utils/persistence";
import {
  onClickEditRoom as onClickEditRoomHelper,
  onEditRoomTemplate,
  onShowEditingToast,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowWaitOperationToast,
  systemFolders,
} from "./helpers";
import type {
  TContextItem,
  TContextItemSecurity,
  TContextOption,
  TStoreCustomEvent,
} from "./helpers";
import type DialogsStore from "../DialogsStore";
import type ContextOptionsStore from "../ContextOptionsStore";

export const onClickReconnectStorageImpl = async (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  const { thirdPartyStore } = self.filesSettingsStore;

  const { openConnectWindow, connectItems } = thirdPartyStore;

  const {
    setRoomCreation,
    setConnectItem,
    setConnectDialogVisible,
    setIsConnectDialogReconnect,
    setSaveAfterReconnectOAuth,
  } = self.dialogsStore;

  setIsConnectDialogReconnect(true);

  setRoomCreation(true);

  // the original .js assumed the provider is always found
  // (crashed otherwise) — the non-null assertion keeps that behavior.
  const provider = connectItems.find(
    (connectItem) => connectItem.providerName === item.providerKey,
  )!;

  const itemThirdParty = {
    title: connectedCloudsTypeTitleTranslation(provider.providerName, t),
    customer_title: "NOTITLE",
    provider_key: provider.providerName,
    link: provider.oauthHref,
    provider_id: item.providerId,
  };

  if (provider.isOauth) {
    const authModal = window.open(
      "",
      t("Common:Authorization"),
      "height=600, width=1020",
    );
    await openConnectWindow(provider.providerName, authModal)
      .then(getOAuthToken)
      .then((token) => {
        // the original .js assumed window.open succeeded
        // (crashed on null) — the non-null assertion keeps that behavior.
        authModal!.close();
        setConnectItem({
          ...itemThirdParty,
          token,
        });

        setSaveAfterReconnectOAuth(true);
      })
      .catch((err: unknown) => {
        if (!err) return;
        toastr.error(err as string);
      });
  } else {
    setConnectItem(itemThirdParty);
    setConnectDialogVisible(true);
  }
};


export const onClickMakeFormImpl = (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  const { setConvertPasswordDialogVisible, setFormCreationInfo } =
    self.dialogsStore;
  // the original .js assumed a file item (fileExst/folderId
  // always present) — the cast keeps identical runtime behavior.
  const { title, id, folderId, fileExst } = item as TContextItem & {
    fileExst: string;
    folderId: number;
  };

  const newTitle =
    title.substring(0, title.length - fileExst.length) +
    self.filesSettingsStore.extsWebRestrictedEditing[0];

  // copyAsAction rejections are untyped (axios error or
  // string) — the structural annotation mirrors the original .js handling.
  type TCopyAsError =
    | string
    | {
        response?: { data?: { error?: { message?: string } } };
        statusText?: string;
        message?: string;
      };

  self.uploadDataStore
    .copyAsAction(id, newTitle, folderId)
    .catch((err: TCopyAsError) => {
      let errorMessage = "";
      if (typeof err === "object") {
        errorMessage =
          err?.response?.data?.error?.message ||
          err?.statusText ||
          err?.message ||
          "";
      } else {
        errorMessage = err;
      }

      if (errorMessage.indexOf("password") == -1) {
        toastr.error(errorMessage, t("Common:Warning"));
        return;
      }

      toastr.error(t("Translations:FileProtected"), t("Common:Warning"));
      setFormCreationInfo({
        newTitle,
        fromExst: fileExst,
        toExst: self.filesSettingsStore.extsWebRestrictedEditing[0],
        fileInfo: item,
      });
      setConvertPasswordDialogVisible(true);
    });
};


export const onCopyLinkImpl = async (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  const { shared, navigationPath } = self.selectedFolderStore;

  const isArchive = item.rootFolderType === FolderType.Archive;

  const { href } = item;

  const sharedItem = navigationPath.find((r) => r.shared);

  const isShared = shared || sharedItem || item.shared;

  const isSystemFolder = systemFolders.includes(item.type as FolderType);

  if (isShared && !isArchive && !isSystemFolder && item.canShare) {
    try {
      const itemLink = item.isFolder
        ? await getFolderLink(item.id)
        : await getFileLink(item.id);

      if (
        self.filesSettingsStore.isLinkBlockedByAdmin(
          item as { rootFolderType: FolderType },
          itemLink,
        )
      ) {
        toastr.error(t("Common:LinkBlockedByAdminWarning"));
        return;
      }

      copyToBuffer(itemLink.sharedTo.shareLink);

      if (!item.isFolder && !item.isRoom) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: AnalyticsEvents.FileShared,
          id: item.id,
          parentId: item.folderId,
        });
      }

      item.customFilterEnabled
        ? toastr.success(
            <Trans
              t={t as unknown as TFunction}
              i18nKey="Common:LinkCopySuccessWithCustomFilter"
            />,
          )
        : toastr.success(t("Common:LinkCopySuccess"));
    } catch (error) {
      toastr.error(error as string);
    }
    return;
  }

  if (item.shortWebUrl) {
    copyToBuffer(item.shortWebUrl);
    return toastr.success(t("Common:LinkCopySuccess"));
  }

  if (
    (item.rootFolderType === FolderType.Recent ||
      item.rootFolderType === FolderType.SHARE) &&
    item.webUrl
  ) {
    copy(item.webUrl);
    return toastr.success(t("Common:LinkCopySuccess"));
  }

  if (href) {
    copy(href);

    return toastr.success(t("Common:LinkCopySuccess"));
  }

  const { canConvert } = self.filesSettingsStore;

  const { getItemUrl } = self.filesStore;

  const needConvert = canConvert(item.fileExst as string);

  const canOpenPlayer =
    item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

  const url = getItemUrl(
    item.id,
    item.isRoom || item.isFolder,
    needConvert,
    canOpenPlayer,
    "",
    item.roomType === RoomsType.AIRoom,
  );

  copy(url);

  toastr.success(t("Common:LinkCopySuccess"));
};


export const onOpenEmbeddingSettingsImpl = async (
self: ContextOptionsStore,item: TContextItem
)=> {
  const { setLinkParams, setEmbeddingPanelData } = self.dialogsStore;

  // the original .js sets linkParams without the `link`
  // field required by LinkParamsType — the cast keeps that runtime shape.
  setLinkParams({
    item,
  } as unknown as Parameters<DialogsStore["setLinkParams"]>[0]);

  setEmbeddingPanelData({ visible: true, item });
};


export const onCreateAndCopySharedLinkImpl = async (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  const { isExpiredLinkAsync } = self.filesActionsStore;

  if (
    item.external &&
    (item.isLinkExpired || (await isExpiredLinkAsync(item)))
  )
    return toastr.error(
      t("Common:RoomLinkExpired"),
      t("Common:RoomNotAvailable"),
    );

  const primaryLink = await self.filesStore.getPrimaryLink(item.id);

  if (primaryLink) {
    if (
      self.filesSettingsStore.isLinkBlockedByAdmin(
        item as { rootFolderType: FolderType },
        primaryLink,
      )
    ) {
      toastr.error(t("Common:LinkBlockedByAdminWarning"));
      return;
    }

    copyShareLink(
      item as TFile | TFolder | TRoom,
      primaryLink,
      t as unknown as TFunction,
      self.getManageLinkOptions(item),
    );

    self.publicRoomStore.setExternalLink(primaryLink);

    if (item.isRoom || !item.isFolder) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: item.isRoom
          ? AnalyticsEvents.RoomShared
          : AnalyticsEvents.FileShared,
        id: item.id,
        parentId: item.isRoom ? item.parentId : item.folderId,
      });
    }
  }
};


export const onRemoveSharedFilesOrFolderImpl = async (
self: ContextOptionsStore,items: TContextItem[]
)=> {
  if (!Array.isArray(items) || items.length === 0) return;

  const { addActiveItems } = self.filesStore;
  const { setGroupMenuBlocked } = self.filesActionsStore;
  // const { clearActiveOperations } = self.uploadDataStore;

  const { folderIds, fileIds } = items.reduce<{
    folderIds: number[];
    fileIds: number[];
  }>(
    (acc, item) => {
      if (isFolderUtil(item) || isRoomUtil(item)) acc.folderIds.push(item.id);
      else if (isFileUtil(item)) acc.fileIds.push(item.id);

      return acc;
    },
    { folderIds: [], fileIds: [] },
  );

  try {
    runInAction(() => {
      setGroupMenuBlocked(true);
      addActiveItems(fileIds, folderIds);
    });

    await removeSharedFolderOrFile(folderIds, fileIds);
  } catch (error) {
    console.error(error);
    toastr.error(error as string);
  } finally {
    runInAction(() => {
      setGroupMenuBlocked(false);
    });
  }
};


export const startFillingInRoleBasedRoomImpl = (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  if (isMobile)
    return toastr.info(t("Common:MobileStartFillingPdfNotAvailableInfo"));

  const refPage = self.filesStore.openDocEditor(
    item.id,
    false,
    null,
    true,
    false,
  );

  if (refPage) refPage.sessionStorage.setItem(FILLING_STATUS_ID, "true");
};


export const startFillingInFormRoomImpl = async (
self: ContextOptionsStore,item: TContextItem
)=> {
  try {
    await manageFormFilling(item.id, FormFillingManageAction.Start);

    // the original .js assumed a signed-in user and a file
    // item here — the assertions/casts keep identical runtime behavior.
    showCreatedPDFFormDialog(item as TFile, self.userStore.user!.id);
  } catch (error) {
    toastr.error(error as string);
  }
};


export const onClickResetAndStartFillingImpl = async (
self: ContextOptionsStore,item: TContextItem
)=> {
  const { addActiveItems } = self.filesStore;
  const { clearActiveOperations } = self.uploadDataStore;
  const { setGroupMenuBlocked } = self.filesActionsStore;

  const { endLoader, startLoader } = createLoader();

  try {
    startLoader(() => {
      runInAction(() => {
        setGroupMenuBlocked(true);
        addActiveItems([item.id], null);
      });
    });

    await formRoleMapping({
      formId: item.id,
      roles: [],
    });
  } catch (error) {
    toastr.error(error as string);
    console.error(error);
  } finally {
    endLoader(() =>
      runInAction(() => {
        setGroupMenuBlocked(false);
        clearActiveOperations([item.id]);
      }),
    );
  }
};


export const onClickDeleteSelectedFolderImpl = (
self: ContextOptionsStore,t: TTranslation, isRoom?: boolean
)=> {
  const { setIsFolderActions, setDeleteDialogVisible, setIsRoomDelete } =
    self.dialogsStore;
  const { confirmDelete } = self.filesSettingsStore;
  const { deleteAction, deleteRoomsAction } = self.filesActionsStore;
  const { id: selectedFolderId, getSelectedFolder } =
    self.selectedFolderStore;
  const { isThirdPartySelection, setBufferSelection } = self.filesStore;

  const selectedFolder = getSelectedFolder();

  setIsFolderActions(true);

  if (confirmDelete || isThirdPartySelection) {
    setBufferSelection(selectedFolder);
    // the original .js passes `undefined` through here when
    // the caller omits isRoom — the cast keeps the exact runtime value.
    setIsRoomDelete(isRoom as boolean);
    setDeleteDialogVisible(true);

    return;
  }

  let translations: Record<string, string>;

  if (isRoom) {
    translations = {
      successRemoveRoom: t("Common:RoomRemoved"),
      successRemoveRooms: t("Common:RoomsRemoved"),
    };

    deleteRoomsAction([selectedFolderId], translations).catch(
      (err: unknown) => toastr.error(err as string),
    );
  } else {
    translations = {
      deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
        sectionName: t("Common:TrashSection"),
      }),
    };

    deleteAction(translations, [selectedFolder], true).catch((err: unknown) =>
      toastr.error(err as string),
    );
  }
};


export const onAddRoomsToGroupImpl = async (
self: ContextOptionsStore,
  roomIds: number[],
  groupId: string,
  t: TTranslation,
  groupName: string,

)=> {
  try {
    await self.dialogsStore.updateRoomGroup(groupId, {
      roomsToAdd: roomIds,
    });
    await self.dialogsStore.getAllRoomGroups();
    const transProps = {
      t: t as unknown as TFunction,
      values: { groupName },
      components: { 1: React.createElement("strong") },
    };
    const keys = {
      single: { tKey: "GroupingRooms:RoomAddedToGroup" },
      multiple: { tKey: "GroupingRooms:RoomsAddedToGroup" },
    };
    const i18nKey =
      roomIds.length === 1 ? keys.single.tKey : keys.multiple.tKey;
    toastr.success(
      React.createElement(Trans, {
        i18nKey,
        ...transProps,
      }),
    );
  } catch (error) {
    console.error("Error adding rooms to group:", error);
    toastr.error(t("Common:Error"));
  }
};


export const onRemoveRoomsFromGroupImpl = async (
self: ContextOptionsStore,roomIds: number[], t: TTranslation
)=> {
  const currentGroupId = self.filesStore.roomsFilter?.groupId;
  if (!currentGroupId) return;

  const currentGroup = self.dialogsStore.roomGroups?.find(
    (g) => String(g.id) === String(currentGroupId),
  );
  const groupName = currentGroup?.name || "";

  try {
    await self.dialogsStore.updateRoomGroup(currentGroupId, {
      roomsToRemove: roomIds,
    });
    await self.dialogsStore.getAllRoomGroups();

    // Remove the rooms from the current view
    self.filesStore.removeFiles(null, roomIds);

    const transProps = {
      t: t as unknown as TFunction,
      values: { groupName },
      components: { 1: React.createElement("strong") },
    };
    const keys = {
      single: { tKey: "GroupingRooms:RoomRemovedFromGroup" },
      multiple: { tKey: "GroupingRooms:RoomsRemovedFromGroup" },
    };
    const i18nKey =
      roomIds.length === 1 ? keys.single.tKey : keys.multiple.tKey;
    toastr.success(
      React.createElement(Trans, {
        i18nKey,
        ...transProps,
      }),
    );
  } catch (error) {
    console.error("Error removing rooms from group:", error);
    toastr.error(t("Common:Error"));
  }
};


export const onCreateTemplateImpl = async (
self: ContextOptionsStore,_navigate?: unknown
)=> {
  self.oformsStore.setIsVisibleInfoPanelTemplateGallery(false);

  const extension = self.oformsStore.currentExtensionGallery.replace(".", "");

  const event: TStoreCustomEvent = new CustomEvent(Events.CREATE, {
    detail: {
      parentId: self.selectedFolderStore.id,
      context: "template",
      extension,
    },
  });

  const payload = {
    extension,
    id: -1,
    fromTemplate: true,
    // the original .js assumed a selected gallery template
    // here (crashed on null) — the non-null assertion keeps that behavior.
    title: self.oformsStore.gallerySelected!.attributes.name_form,
    openEditor: true,
    edit: true,
  };

  event.payload = payload;

  window.dispatchEvent(event);
};


export const onSyncXlsxDataImpl = async (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  const { clearSecondaryProgressData, setSecondaryProgressBarData } =
    self.filesActionsStore.uploadDataStore.secondaryProgressDataStore;

  try {
    const response = await XlsxUpdateService.start(item.id, isFolder(item));

    if (!response) return;

    const { form, task, isNewFile } = response;

    if (task.isCompleted) {
      XlsxUpdateService.assertTaskSucceeded(task);
    } else {
      const basePayload = {
        operationId: task.id,
        operation: OPERATIONS_NAME.other,
      };

      setSecondaryProgressBarData({ ...basePayload, percent: 0 });

      await XlsxUpdateService.poll(form.id, task.id, (progress) => {
        setSecondaryProgressBarData({
          ...basePayload,
          percent: progress?.percentage ?? 100,
          completed: progress?.isCompleted ?? true,
        });
      }).catch((error) => {
        clearSecondaryProgressData(task.id, OPERATIONS_NAME.other);
        throw error;
      });
    }

    const messageVar = { formName: form.title };

    toastr.success(
      isNewFile
        ? t("Common:SpreadsheetGenerated", messageVar)
        : t("Common:SpreadsheetUpdated", messageVar),
    );
  } catch (error) {
    toastr.error(error as string);
    console.error(error);
  }
};


export const handleCopyPrimaryLinkImpl = async (
self: ContextOptionsStore,item: TContextItem, t: TTranslation
)=> {
  if (!item.canShare) return;

  const primaryLink = await ShareLinkService.getPrimaryLink(
    item as TFile | TFolder | TRoom,
  );

  if (primaryLink) {
    if (primaryLink.sharedTo?.isExpired) {
      toastr.error(t("Common:LinkExpired"));
      return;
    }

    if (
      self.filesSettingsStore.isLinkBlockedByAdmin(
        item as { rootFolderType: FolderType },
        primaryLink,
      )
    ) {
      toastr.error(t("Common:LinkBlockedByAdminWarning"));
      return;
    }

    copyShareLink(
      item as TFile | TFolder | TRoom,
      primaryLink,
      t as unknown as TFunction,
      self.getManageLinkOptions(item),
    );
    self.infoPanelStore?.setShareChanged(true);

    if (item.isRoom || !item.isFolder) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: item.isRoom
          ? AnalyticsEvents.RoomShared
          : AnalyticsEvents.FileShared,
        id: item.id,
        parentId: item.isRoom ? item.parentId : item.folderId,
      });
    }
  }
};


export const _resolveRoomImpl = async (
self: ContextOptionsStore
): Promise<TContextItem | null>=> {
  const { infoPanelRoom } = self.infoPanelStore;
  const selectedFolder = self.selectedFolderStore.getSelectedFolder();

  // rooms resolved here are TRoom/TSelectedFolder shapes
  // consumed as .js view-models — the casts keep the original duck typing.
  if (infoPanelRoom) return infoPanelRoom as unknown as TContextItem;
  if (selectedFolder.isRoom) return selectedFolder as unknown as TContextItem;

  const roomPath = selectedFolder.pathParts.find((path) => path.roomType);
  if (!roomPath) return null;

  const [room = null] = self.filesStore.getFilesListItems([
    await getRoomInfo(roomPath.id),
  ]);
  return room;
};


export const _syncInfoPanelRoomImpl = (
self: ContextOptionsStore,newRoom: TRoom
)=> {
  const { infoPanelStore } = self;
  if (infoPanelStore.isVisible && infoPanelStore.isDetailsTabActive) {
    infoPanelStore.setInfoPanelRoom(newRoom);
  }
};


export const askAIImpl = async (
self: ContextOptionsStore,item: TContextItem
)=> {
  const skipAi = getPersisted(PersistenceKeys.skipAiModal, false);

  if (item.parentRoomType !== FolderType.FormRoom || skipAi) {
    self.filesActionsStore.askAIAction(item);
    return;
  }

  const { addActiveItems } = self.filesStore;
  const { clearActiveOperations } = self.uploadDataStore;
  const { endLoader, startLoader } = createLoader();

  try {
    startLoader(() => addActiveItems([item.id], null));

    const room = await self._resolveRoom();
    if (!room) return;

    if (room.sendFormToExternalDB || !room.security?.EditRoom) {
      self.filesActionsStore.askAIAction(item);
      return;
    }

    self.dialogsStore.setAskAIConnectDialogVisible(true, (action) => {
      if (action === "connect") {
        onEditRoomTemplate(room, self._syncInfoPanelRoom);
      } else if (action === "continue") {
        self.filesActionsStore.askAIAction(item);
      }
    });
  } catch (error) {
    toastr.error(error as string);
  } finally {
    endLoader(() => clearActiveOperations([item.id]));
  }
};

