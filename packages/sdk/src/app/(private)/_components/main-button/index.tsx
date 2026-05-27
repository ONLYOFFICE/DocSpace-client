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
import { useTranslation } from "react-i18next";

import { MainButton } from "@docspace/ui-kit/components/main-button";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import CreateFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import UploadFileReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

// Slim main-button for private rooms — intentionally rewritten (not forked
// from DocsMainButton) because private rooms support only two actions:
// CreateFolder and encrypted file upload. No DOCX/PPTX/XLSX/PDF creation
// (no editor integration in (private)), no folder upload (no recursive
// encryption support yet), no template gallery, no form-related options.

export type PrivateMainButtonProps = {
  isDisabled?: boolean;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
};

export const PrivateMainButton: React.FC<PrivateMainButtonProps> = ({
  isDisabled,
  onCreateFolder,
  onUploadFiles,
}) => {
  const { t } = useTranslation(["Common"]);

  const model = React.useMemo<ContextMenuModel[]>(
    () => [
      {
        id: "private-actions_create-folder",
        key: "private-create-folder",
        label: t("Common:NewFolder"),
        icon: CreateFolderReactSvgUrl,
        onClick: onCreateFolder,
      },
      {
        id: "private-actions_upload-files",
        key: "private-upload-files",
        label: t("Common:UploadFiles"),
        icon: UploadFileReactSvgUrl,
        onClick: onUploadFiles,
      },
    ],
    [t, onCreateFolder, onUploadFiles],
  );

  return (
    <MainButton
      id="private-actions-main-button"
      text={t("Common:Actions")}
      isDropdown
      isDisabled={isDisabled}
      model={isDisabled ? [] : model}
    />
  );
};

export default PrivateMainButton;
