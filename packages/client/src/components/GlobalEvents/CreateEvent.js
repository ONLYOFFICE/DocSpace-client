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

import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import api from "@docspace/shared/api";
import { AnalyticsEvents } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { showSuccessCreateFolder } from "SRC_DIR/helpers/toast-helpers";
import config from "PACKAGE_FILE";

import {
  getDefaultFileName,
  getDefaultFileTestIdPrefix,
} from "SRC_DIR/helpers/filesUtils";

import { getTitleWithoutExtension } from "@docspace/shared/utils";
import { frameCallEvent } from "@docspace/shared/utils/common";
import Dialog from "./sub-components/Dialog";

const CreateEvent = ({
  id,
  type,
  extension,
  title,
  templateId,
  fromTemplate,
  onClose,

  addActiveItems,

  gallerySelected,
  setGallerySelected,
  setCreatedItem,

  parentId,
  isIndexing,

  completeAction,
  openItemAction,

  clearActiveOperations,

  setEventDialogVisible,
  eventDialogVisible,
  keepNewFileName,
  setPortalTariff,
  withoutDialog,
  preview,
  toForm,
  publicRoomKey,
  actionEdit,
  openOnNewPage,
  openEditor,
  createFile,

  isFrame,
  frameConfig,
}) => {
  const [headerTitle, setHeaderTitle] = React.useState(null);
  const [startValue, setStartValue] = React.useState("");

  const { t } = useTranslation(["Translations", "Common"]);

  const onCloseAction = useCallback(
    (e) => {
      if (gallerySelected) {
        setGallerySelected && setGallerySelected(null);
      }

      setEventDialogVisible(false);
      onClose && onClose(e);
    },
    [setGallerySelected, gallerySelected, setEventDialogVisible, onClose],
  );

  const onSave = useCallback(
    async (e, value, open = true) => {
      let item;
      let createdFolderId;

      const isMakeFormFromFile = !!templateId;

      let newValue = value;

      if (value.trim() === "") {
        newValue =
          templateId === null
            ? getDefaultFileName(extension)
            : getTitleWithoutExtension({ fileExst: extension });

        setStartValue(newValue);
      }

      const isPaymentRequiredError = (err) => {
        if (err?.response?.status === 402) setPortalTariff();
      };

      if (!extension) {
        await api.files
          .createFolder(parentId, newValue.trimEnd())
          .then((folder) => {
            item = folder;
            createdFolderId = folder.id;
            addActiveItems(null, [folder.id]);
            setCreatedItem({ id: createdFolderId, type: "folder" });
            window.dispatchEvent(
              new CustomEvent("folder_created", {
                detail: {
                  id: folder.id,
                  parentId: folder.parentId,
                },
              }),
            );
          })
          .then(() => completeAction(item, type, true))
          .then(() => {
            if (isIndexing) showSuccessCreateFolder(t, item, openItemAction);
          })
          .catch((err) => {
            isPaymentRequiredError(err);
            toastr.error(err);
          })
          .finally(() => {
            const folderIds = [+id];
            createdFolderId && folderIds.push(createdFolderId);

            clearActiveOperations(null, folderIds);
            onCloseAction();
          });
      } else {
        try {
          if (openEditor && !(isFrame && frameConfig?.events?.onEditorOpen)) {
            const searchParams = new URLSearchParams();

            searchParams.append("parentId", parentId);
            searchParams.append("fileTitle", `${newValue}.${extension}`);
            searchParams.append("open", open);
            searchParams.append("id", id);

            if (preview) {
              searchParams.append("action", "view");
            }

            if (actionEdit) {
              searchParams.append("action", "edit");
            }

            if (toForm) searchParams.append("toForm", "true");

            if (publicRoomKey) {
              searchParams.append("share", publicRoomKey);
            }

            if (isMakeFormFromFile) {
              searchParams.append("fromFile", isMakeFormFromFile);
              searchParams.append("templateId", templateId);
            } else if (fromTemplate) {
              searchParams.append("fromTemplate", fromTemplate);
              searchParams.append("formId", gallerySelected.id);
            }

            searchParams.append("hash", new Date().getTime());

            const url = combineUrl(
              window.location.origin,
              window.ClientConfig?.proxy?.url,
              config.homepage,
              `/doceditor/create?${searchParams.toString()}`,
            );

            window.open(url, openOnNewPage ? "_blank" : "_self");

            return;
          }

          await createFile(
            +parentId,
            `${newValue}.${extension}`,
            templateId,
            gallerySelected?.id,
          )
            .then((data) => {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: AnalyticsEvents.FileCreated,
                id: data.id,
                parentId: data.folderId,
                file_type: extension,
              });
              if (isFrame && frameConfig?.events?.onEditorOpen) {
                frameCallEvent({
                  event: "onEditorOpen",
                  data,
                });
              }
            })
            .catch((error) => {
              toastr.error(error);
            });
        } catch (error) {
          toastr.error(error);
        } finally {
          onCloseAction();
        }
      }
    },
    [
      parentId,
      extension,
      templateId,
      title,
      fromTemplate,
      withoutDialog,
      keepNewFileName,
      gallerySelected?.id,
      openOnNewPage,
      openEditor,
      preview,
      actionEdit,
      toForm,
      publicRoomKey,
      createFile,
      onCloseAction,
    ],
  );

  React.useEffect(() => {
    const defaultName = getDefaultFileName(extension);

    if (title) {
      const item = { fileExst: extension, title };

      setStartValue(getTitleWithoutExtension(item, fromTemplate));
    } else {
      setStartValue(defaultName);
    }

    setHeaderTitle(defaultName);

    if (!extension) return setEventDialogVisible(true);

    if (!keepNewFileName && !withoutDialog) {
      setEventDialogVisible(true);
    } else {
      onSave(null, title || defaultName);
    }

    return () => {
      setEventDialogVisible(false);
    };
  }, [extension, title, fromTemplate, withoutDialog, onSave]);

  return (
    <Dialog
      t={t}
      withForm
      visible={eventDialogVisible}
      title={headerTitle}
      testIdPrefix={getDefaultFileTestIdPrefix(extension)}
      startValue={startValue}
      onSave={onSave}
      onCancel={onCloseAction}
      onClose={onCloseAction}
      isCreateDialog
      extension={extension}
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    filesActionsStore,
    selectedFolderStore,
    treeFoldersStore,
    uploadDataStore,
    dialogsStore,
    oformsStore,
    filesSettingsStore,
    currentTariffStatusStore,
    publicRoomStore,
  }) => {
    const publicRoomKey = publicRoomStore.publicRoomKey;

    const {
      createFile,
      addActiveItems,

      setIsUpdatingRowItem,
      setCreatedItem,
    } = filesStore;

    const { gallerySelected, setGallerySelected } = oformsStore;

    const { completeAction, openItemAction } = filesActionsStore;

    const { clearActiveOperations, fileCopyAs } = uploadDataStore;

    const { isRecycleBinFolder, isPrivacyFolder } = treeFoldersStore;

    const { id: parentId, isIndexedFolder } = selectedFolderStore;

    const { isDesktopClient, isFrame, frameConfig } = settingsStore;

    const { setPortalTariff } = currentTariffStatusStore;

    const {
      setConvertPasswordDialogVisible,
      setEventDialogVisible,
      setFormCreationInfo,
      eventDialogVisible,
    } = dialogsStore;

    const { keepNewFileName, openOnNewPage } = filesSettingsStore;

    return {
      setPortalTariff,
      setEventDialogVisible,
      eventDialogVisible,
      createFile,

      addActiveItems,

      setIsUpdatingRowItem,
      gallerySelected,
      setGallerySelected,
      setCreatedItem,

      parentId,
      isIndexing: isIndexedFolder,

      isDesktop: isDesktopClient,
      isPrivacy: isPrivacyFolder,
      isTrashFolder: isRecycleBinFolder,
      completeAction,
      openItemAction,

      clearActiveOperations,
      fileCopyAs,

      setConvertPasswordDialogVisible,
      setFormCreationInfo,

      keepNewFileName,
      publicRoomKey,
      openOnNewPage,

      isFrame,
      frameConfig,
    };
  },
)(observer(CreateEvent));
