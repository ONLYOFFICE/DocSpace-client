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

import { Trans } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { isFile, isFolder } from "@docspace/shared/utils/typeGuards";

const separateItems = (selection) => {
  const files = selection.filter((item) => isFile(item));
  const folders = selection.filter((item) => isFolder(item));

  return { files, folders };
};

export const getDialogContent = (
  t,
  selection,
  isTemplate,
  isRoomDelete,
  isRecycleBinFolder,
  isPersonalRoom,
  isRoom,
  isTemplatesFolder,
  isSharedWithMeFolderRoot,
  isAIAgent,
  unsubscribe,
) => {
  if (!selection) return null;

  const isFolder = selection[0]?.isFolder || !!selection[0]?.parentId;
  const isSingle = selection.length === 1;
  const isThirdParty = selection[0]?.providerKey;

  if (unsubscribe) {
    return isSingle ? (
      <Trans
        i18nKey="removeFromListDescription"
        ns="DeleteDialog"
        t={t}
        values={{ title: selection[0]?.title }}
        components={{ 1: <Text fontWeight={600} as="span" /> }}
      />
    ) : (
      <Trans
        i18nKey="removeFromListDescriptionPlural"
        ns="DeleteDialog"
        t={t}
        values={{ count: selection.length }}
        components={{ 1: <Text fontWeight={600} as="span" /> }}
      />
    );
  }

  if (isAIAgent) {
    return (
      <>
        <Trans
          t={t}
          i18nKey="DeleteAIAgentDescription"
          ns="DeleteDialog"
          values={{ agentName: selection[0]?.title }}
        />{" "}
        {t("Common:WantToContinue")}
      </>
    );
  }

  if (isTemplate) {
    return isSingle ? (
      <Trans
        i18nKey="DeleteTemplate"
        ns="DeleteDialog"
        t={t}
        values={{ templateName: selection[0]?.title }}
        components={{ 1: <Text fontWeight={600} as="span" /> }}
      />
    ) : (
      t("DeleteTemplates")
    );
  }

  if (isRoomDelete) {
    return (
      <>
        <Trans t={t} i18nKey="DeleteRoom" ns="DeleteDialog">
          The room <strong>\"{{ roomName: selection[0]?.title }}\"</strong>
          will be permanently deleted. All data and user accesses will be lost.
        </Trans>{" "}
        {t("Common:WantToContinue")}
      </>
    );
  }

  if (isRecycleBinFolder || isThirdParty) {
    if (isSingle) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteItemForever" ns="DeleteDialog">
            You are about to delete{" "}
            <strong>{{ name: selection[0]?.title }}</strong>.
          </Trans>{" "}
          {!isThirdParty
            ? isFolder
              ? t("FolderPermanentlyDeleted", {
                  trashSection: t("Common:TrashSection"),
                })
              : t("FilePermanentlyDeleted", {
                  trashSection: t("Common:TrashSection"),
                })
            : t("DeleteItemsSharedNote")}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }
    const items = separateItems(selection);
    const filesCount = items.files.length;
    const foldersCount = items.folders.length;

    if (filesCount && foldersCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFilesAndFoldersForever" ns="DeleteDialog">
            You are about to delete the{" "}
            <strong>files ({{ filesCount }})</strong> and{" "}
            <strong>folders ({{ foldersCount }})</strong>.
          </Trans>{" "}
          {!isThirdParty
            ? t("ItemsPermanentlyDeleted", {
                trashSection: t("Common:TrashSection"),
              })
            : t("DeleteItemsSharedNote")}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }

    if (filesCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFilesForever" ns="DeleteDialog">
            You are about to delete <strong>files ({{ filesCount }})</strong>.
          </Trans>{" "}
          {!isThirdParty
            ? t("FilesPermanentlyDeleted", {
                trashSection: t("Common:TrashSection"),
              })
            : t("DeleteItemsSharedNote")}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }

    if (foldersCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFoldersForever" ns="DeleteDialog">
            You are about to delete{" "}
            <strong>folders ({{ foldersCount }})</strong>.
          </Trans>{" "}
          {!isThirdParty
            ? t("FoldersPermanentlyDeleted", {
                trashSection: t("Common:TrashSection"),
              })
            : t("DeleteItemsSharedNote")}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }
  }

  if (
    isPersonalRoom ||
    isRoom ||
    isTemplatesFolder ||
    isSharedWithMeFolderRoot
  ) {
    if (isSingle) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteItem" ns="DeleteDialog">
            You are about to move{" "}
            <strong>{{ name: selection[0]?.title }}</strong>
            to {{ trashSection: t("Common:TrashSection") }}.
          </Trans>{" "}
          {!isThirdParty
            ? isFolder
              ? t("FolderDeletedAfter")
              : t("FileDeletedAfter")
            : null}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }

    const items = separateItems(selection);
    const filesCount = items.files.length;
    const foldersCount = items.folders.length;

    if (filesCount && foldersCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFilesAndFolders" ns="DeleteDialog">
            You are about to delete the{" "}
            <strong>files ({{ filesCount }})</strong> and{" "}
            <strong>folders ({{ foldersCount }})</strong> to{" "}
            {{ trashSection: t("Common:TrashSection") }}.
          </Trans>{" "}
          {!isThirdParty ? t("ItemsDeletedAfter") : null}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }

    if (filesCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFiles" ns="DeleteDialog">
            You are about to move <strong>files ({{ filesCount }})</strong> to
            {{ trashSection: t("Common:TrashSection") }}.{" "}
          </Trans>{" "}
          {!isThirdParty ? t("FilesDeletedAfter") : null}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }

    if (foldersCount) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteFolders" ns="DeleteDialog">
            You are about to move <strong>folders ({{ foldersCount }})</strong>{" "}
            to {{ trashSection: t("Common:TrashSection") }}.{" "}
          </Trans>{" "}
          {!isThirdParty ? t("FoldersDeletedAfter") : null}{" "}
          {t("Common:WantToContinue")}
        </>
      );
    }
  }
};
