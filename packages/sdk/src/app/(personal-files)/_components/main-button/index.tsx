// (c) Copyright Ascensio System SIA 2009-2026
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
