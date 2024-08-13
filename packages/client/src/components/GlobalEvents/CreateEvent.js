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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { setEncryptionAccess } from "SRC_DIR/helpers/desktop";
import config from "PACKAGE_FILE";

import { getDefaultFileName } from "@docspace/client/src/helpers/filesUtils";

import Dialog from "./sub-components/Dialog";
import { getTitleWithoutExtension } from "@docspace/shared/utils";

const CreateEvent = ({
  id,
  type,
  extension,
  title,
  templateId,
  fromTemplate,
  onClose,
  setIsLoading,

  createFolder,
  addActiveItems,

  gallerySelected,
  setGallerySelected,
  setCreatedItem,

  parentId,

  completeAction,

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
}) => {
  const [headerTitle, setHeaderTitle] = React.useState(null);
  const [startValue, setStartValue] = React.useState("");

  const { t } = useTranslation(["Translations", "Common"]);

  const onCloseAction = (e) => {
    if (gallerySelected) {
      setGallerySelected && setGallerySelected(null);
    }

    setEventDialogVisible(false);
    onClose && onClose(e);
  };

  React.useEffect(() => {
    const defaultName = getDefaultFileName(extension);

    if (title) {
      const item = { fileExst: extension, title: title };

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
  }, [extension, title, fromTemplate, withoutDialog]);

  const onSave = async (e, value, open = true) => {
    let item;
    let createdFolderId;

    const isMakeFormFromFile = templateId ? true : false;

    setIsLoading(true);

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
      createFolder(parentId, newValue)
        .then((folder) => {
          item = folder;
          createdFolderId = folder.id;
          addActiveItems(null, [folder.id]);
          setCreatedItem({ id: createdFolderId, type: "folder" });
        })
        .then(() => completeAction(item, type, true))
        .catch((e) => {
          isPaymentRequiredError(e);
          toastr.error(e);
        })
        .finally(() => {
          const folderIds = [+id];
          createdFolderId && folderIds.push(createdFolderId);

          clearActiveOperations(null, folderIds);
          onCloseAction();
          return setIsLoading(false);
        });
    } else {
      try {
        if (openEditor) {
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

        return await createFile(
          +parentId,
          `${newValue}.${extension}`,
          templateId,
          gallerySelected?.id,
        ).catch((error) => {
          toastr.error(error);
        });
      } catch (error) {
        toastr.error(error);
      } finally {
        setIsLoading(false);
        onCloseAction();
      }
    }
  };

  return (
    <Dialog
      t={t}
      withForm
      visible={eventDialogVisible}
      title={headerTitle}
      startValue={startValue}
      onSave={onSave}
      onCancel={onCloseAction}
      onClose={onCloseAction}
      isCreateDialog={true}
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
    clientLoadingStore,
    currentTariffStatusStore,
    publicRoomStore,
  }) => {
    const { setIsSectionBodyLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const publicRoomKey = publicRoomStore.publicRoomKey;

    const {
      createFile,
      createFolder,
      addActiveItems,

      setIsUpdatingRowItem,
      setCreatedItem,
    } = filesStore;

    const { gallerySelected, setGallerySelected } = oformsStore;

    const { completeAction } = filesActionsStore;

    const { clearActiveOperations, fileCopyAs } = uploadDataStore;

    const { isRecycleBinFolder, isPrivacyFolder } = treeFoldersStore;

    const { id: parentId } = selectedFolderStore;

    const { isDesktopClient } = settingsStore;

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
      setIsLoading,
      createFile,
      createFolder,
      addActiveItems,

      setIsUpdatingRowItem,
      gallerySelected,
      setGallerySelected,
      setCreatedItem,

      parentId,

      isDesktop: isDesktopClient,
      isPrivacy: isPrivacyFolder,
      isTrashFolder: isRecycleBinFolder,
      completeAction,

      clearActiveOperations,
      fileCopyAs,

      setConvertPasswordDialogVisible,
      setFormCreationInfo,

      keepNewFileName,
      publicRoomKey,
      openOnNewPage,
    };
  },
)(observer(CreateEvent));
