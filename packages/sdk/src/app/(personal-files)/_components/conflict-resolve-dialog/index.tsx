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

import { Trans, useTranslation } from "react-i18next";

import ConflictResolve from "@docspace/shared/dialogs/conflict-resolve/ConflictResolve";
import { ConflictResolveType } from "@docspace/shared/enums";

type ConflictItem = { title: string; isFile: boolean };

type ConflictResolveDialogProps = {
  visible: boolean;
  conflictItems: ConflictItem[];
  onClose: () => void;
  onSubmit: (resolveType: ConflictResolveType) => void;
};

const ConflictResolveDialog = ({
  visible,
  conflictItems,
  onClose,
  onSubmit,
}: ConflictResolveDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const hasFiles = conflictItems.some((i) => i.isFile);
  const hasFolders = conflictItems.some((i) => !i.isFile);

  let messageText: React.ReactNode;
  if (conflictItems.length === 1) {
    const single = conflictItems[0];
    messageText = single.isFile ? (
      <Trans
        t={t}
        ns="Common"
        i18nKey="FileActionRequired"
        values={{ fileName: single.title }}
        components={{ 1: <span key="file-name" className="bold truncate" /> }}
      />
    ) : (
      <Trans
        t={t}
        ns="Common"
        i18nKey="FolderActionRequired"
        values={{ folderName: single.title }}
        components={{ 1: <span key="folder-name" className="bold" /> }}
      />
    );
  } else if (hasFiles && hasFolders) {
    messageText = t("Common:FilesAndFoldersAlreadyContains");
  } else if (hasFolders) {
    messageText = t("Common:FoldersAlreadyContains");
  } else {
    messageText = t("Common:FilesAlreadyContains");
  }

  const overwriteTitle = hasFolders
    ? t("Common:MergeAndOverwrite")
    : t("Common:OverwriteTitle");
  const overwriteDescription = hasFolders
    ? t("Common:MergeFoldersDescription")
    : t("Common:OverwriteDescription");

  const duplicateTitle = hasFolders
    ? t("Common:CopyAndKeepBothFolders")
    : t("Common:CreateFileCopy");
  const duplicateDescription = hasFolders
    ? t("Common:CreateFolderDescription")
    : t("Common:CreateDescription");

  const skipTitle = t("Common:SkipTitle");
  const skipDescription = hasFolders
    ? t("Common:SkipFolderDescription")
    : t("Common:SkipDescription");

  return (
    <ConflictResolve
      visible={visible}
      isLoading={false}
      headerLabel={t("Common:ActionRequired")}
      messageText={messageText}
      selectActionText={t("Common:ConflictResolveSelectAction")}
      overwriteTitle={overwriteTitle}
      overwriteDescription={overwriteDescription}
      duplicateTitle={duplicateTitle}
      duplicateDescription={duplicateDescription}
      skipTitle={skipTitle}
      skipDescription={skipDescription}
      submitButtonLabel={t("Common:OKButton")}
      cancelButtonLabel={t("Common:CancelButton")}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

export default ConflictResolveDialog;
