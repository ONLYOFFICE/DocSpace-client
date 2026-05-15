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
import { MainButtonMobile } from "@docspace/ui-kit/components/main-button-mobile";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { ActionOption, ButtonOption } from "@docspace/ui-kit/components/main-button-mobile/MainButtonMobile.types";

import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

import useDocsActions from "../../_hooks/useDocsActions";
import CreateFileDialog from "../create-file-dialog";

import styles from "./MainButton.module.scss";

type DocsMainButtonDesktopProps = {
  mode: "desktop";
  isDisabled?: boolean;
};

type DocsMainButtonMobileProps = {
  mode: "mobile";
  isDisabled?: boolean;
};

type DocsMainButtonProps =
  | DocsMainButtonDesktopProps
  | DocsMainButtonMobileProps;

const DocsMainButton = ({ mode, isDisabled }: DocsMainButtonProps) => {
  const { t } = useTranslation(["Common"]);
  const {
    openCreateDialog,
    closeCreateDialog,
    onSaveCreate,
    dialogVisible,
    dialogType,
    isCreating,
    onUploadFiles,
    onUploadFolder,
  } = useDocsActions();

  const [isOpenButton, setIsOpenButton] = React.useState(false);

  const toggleOpen = React.useCallback(() => {
    setIsOpenButton((prev) => !prev);
  }, []);

  const desktopModel = React.useMemo<ContextMenuModel[]>(
    () => [
      {
        id: "actions_new-document",
        key: "docx",
        label: t("Common:Document"),
        icon: ActionsDocumentsReactSvgUrl,
        onClick: () => openCreateDialog("docx"),
      },
      {
        id: "actions_new-spreadsheet",
        key: "xlsx",
        label: t("Common:Spreadsheet"),
        icon: SpreadsheetReactSvgUrl,
        onClick: () => openCreateDialog("xlsx"),
      },
      {
        id: "actions_new-presentation",
        key: "pptx",
        label: t("Common:Presentation"),
        icon: ActionsPresentationReactSvgUrl,
        onClick: () => openCreateDialog("pptx"),
      },
      {
        id: "actions_new-form",
        key: "pdf",
        label: t("Common:NewPDFForm"),
        icon: FormBlankReactSvgUrl,
        onClick: () => openCreateDialog("pdf"),
      },
      {
        id: "actions_new-folder",
        key: "new-folder",
        label: t("Common:Folder"),
        icon: CatalogFolderReactSvgUrl,
        onClick: () => openCreateDialog("folder"),
      },
      {
        key: "separator-1",
        isSeparator: true,
      },
      {
        id: "actions_upload-files",
        key: "upload-files",
        label: t("Common:UploadFiles"),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFiles,
      },
      {
        id: "actions_upload-folder",
        key: "upload-folder",
        label: t("Common:UploadFolder"),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFolder,
      },
    ],
    [t, openCreateDialog, onUploadFiles, onUploadFolder],
  );

  const actionOptions = React.useMemo<ActionOption[]>(
    () => [
      {
        key: "docx",
        label: t("Common:Document"),
        icon: ActionsDocumentsReactSvgUrl,
        onClick: () => openCreateDialog("docx"),
      },
      {
        key: "xlsx",
        label: t("Common:Spreadsheet"),
        icon: SpreadsheetReactSvgUrl,
        onClick: () => openCreateDialog("xlsx"),
      },
      {
        key: "pptx",
        label: t("Common:Presentation"),
        icon: ActionsPresentationReactSvgUrl,
        onClick: () => openCreateDialog("pptx"),
      },
      {
        key: "pdf",
        label: t("Common:NewPDFForm"),
        icon: FormBlankReactSvgUrl,
        onClick: () => openCreateDialog("pdf"),
      },
      {
        key: "new-folder",
        label: t("Common:Folder"),
        icon: CatalogFolderReactSvgUrl,
        onClick: () => openCreateDialog("folder"),
      },
    ],
    [t, openCreateDialog],
  );

  const buttonOptions = React.useMemo<ButtonOption[]>(
    () => [
      {
        key: "upload-files",
        label: t("Common:UploadFiles"),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFiles,
      },
    ],
    [t, onUploadFiles],
  );

  const dialog = (
    <CreateFileDialog
      visible={dialogVisible}
      type={dialogType}
      isCreating={isCreating}
      onClose={closeCreateDialog}
      onSave={onSaveCreate}
    />
  );

  if (mode === "desktop") {
    return (
      <>
        <div className={styles.mainButtonWrapper}>
          <MainButton
            id="docs-actions-main-button"
            text={t("Common:Actions")}
            isDropdown
            isDisabled={isDisabled}
            model={isDisabled ? [] : desktopModel}
          />
        </div>
        {dialog}
      </>
    );
  }

  return (
    <>
      <MainButtonMobile
        className={styles.mobileButton}
        actionOptions={isDisabled ? [] : actionOptions}
        buttonOptions={isDisabled ? [] : buttonOptions}
        title={t("Common:Upload")}
        isOpenButton={isOpenButton}
        onUploadClick={isDisabled ? undefined : toggleOpen}
        onClose={toggleOpen}
        withMenu
      />
      {dialog}
    </>
  );
};

export default DocsMainButton;
