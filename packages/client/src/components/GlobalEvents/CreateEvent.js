import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { setEncryptionAccess } from "SRC_DIR/helpers/desktop";
import config from "PACKAGE_FILE";

import { getTitleWithoutExtension } from "SRC_DIR/helpers/filesUtils";
import { getDefaultFileName } from "@docspace/client/src/helpers/filesUtils";

import Dialog from "./sub-components/Dialog";

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
  publicRoomKey,
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

    if (!keepNewFileName) {
      setEventDialogVisible(true);
    } else {
      onSave(null, title || defaultName);
    }

    return () => {
      setEventDialogVisible(false);
    };
  }, [extension, title, fromTemplate]);

  const onSave = (e, value, open = true) => {
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
      const searchParams = new URLSearchParams();

      searchParams.append("parentId", parentId);
      searchParams.append("fileTitle", `${newValue}.${extension}`);
      searchParams.append("open", open);
      searchParams.append("id", id);

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

      const url = combineUrl(
        window.location.origin,
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/doceditor/create?${searchParams.toString()}`,
      );

      window.open(
        url,
        window.DocSpaceConfig?.editor?.openOnNewPage ? "_blank" : "_self",
      );

      setIsLoading(false);
      onCloseAction();
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
      openDocEditor,
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

    const { keepNewFileName } = filesSettingsStore;

    return {
      setPortalTariff,
      setEventDialogVisible,
      eventDialogVisible,
      setIsLoading,
      createFile,
      createFolder,
      addActiveItems,
      openDocEditor,
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
    };
  },
)(observer(CreateEvent));
