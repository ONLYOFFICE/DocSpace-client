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

import { Trans } from "react-i18next";
import { Text } from "@docspace/ui-kit/components/text";
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
  isAIAgentsFolderRoot,
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
    return isSingle ? (
      <>
        <Trans t={t} i18nKey="DeleteRoomConfirm" ns="DeleteDialog">
          The room <strong>\"{{ roomName: selection[0]?.title }}\"</strong>
          will be permanently deleted. All data and user accesses will be lost.
        </Trans>{" "}
        {t("Common:WantToContinue")}
      </>
    ) : (
      <>
        <Trans
          i18nKey="DeleteRooms"
          ns="DeleteDialog"
          t={t}
          values={{ count: selection.length }}
          components={{ 1: <Text fontWeight={600} as="span" /> }}
        />{" "}
        {t("Common:WantToContinue")}
      </>
    );
  }

  if (isRecycleBinFolder || isThirdParty) {
    if (isSingle) {
      return (
        <>
          <Trans t={t} i18nKey="DeleteItemForeverConfirm" ns="DeleteDialog">
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
    isSharedWithMeFolderRoot ||
    isAIAgentsFolderRoot
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
