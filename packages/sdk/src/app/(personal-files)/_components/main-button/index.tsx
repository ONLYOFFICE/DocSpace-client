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

import useDocsActions, {
  type DocsActions,
} from "../../_hooks/useDocsActions";
import { useDocsMenuModels } from "../../_hooks/useDocsMenuModels";
import CreateFileDialog from "../create-file-dialog";

import styles from "./MainButton.module.scss";

type DocsMainButtonProps = {
  mode: "desktop" | "mobile";
  isDisabled?: boolean;
  /**
   * If provided, the button reuses these actions and does not render its own
   * CreateFileDialog (the parent is expected to render one).
   */
  actions?: DocsActions;
};

const DocsMainButton = ({ mode, isDisabled, actions }: DocsMainButtonProps) => {
  const { t } = useTranslation(["Common"]);
  const internalActions = useDocsActions();
  const resolved = actions ?? internalActions;

  const { desktopModel, actionOptions, buttonOptions } = useDocsMenuModels({
    openCreateDialog: resolved.openCreateDialog,
    onUploadFiles: resolved.onUploadFiles,
    onUploadFolder: resolved.onUploadFolder,
  });

  const [isOpenButton, setIsOpenButton] = React.useState(false);
  const toggleOpen = React.useCallback(() => {
    setIsOpenButton((prev) => !prev);
  }, []);

  const dialog = actions ? null : (
    <CreateFileDialog
      visible={resolved.dialogVisible}
      type={resolved.dialogType}
      isCreating={resolved.isCreating}
      onClose={resolved.closeCreateDialog}
      onSave={resolved.onSaveCreate}
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
