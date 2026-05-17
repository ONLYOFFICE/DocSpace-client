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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import ResetConfirmationModal from "SRC_DIR/components/dialogs/ResetConfirmationDialog/ResetConfirmationModal";

const SubmitResetButtons = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Settings", "Common"]);
  const {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    isLoadingXml,
    isSSOAvailable,
    closeResetModal,
    confirmReset,
    isDisabledSaveButton,
  } = props;

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={() => saveSsoSettings(t)}
        onCancelClick={isSsoEnabled ? openResetModal : resetForm}
        showReminder
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings
        hasScroll
        isSaving={isSubmitLoading}
        saveButtonDisabled={isDisabledSaveButton}
        disableRestoreToDefault={
          isSubmitLoading || isLoadingXml || !isSSOAvailable
        }
        additionalClassSaveButton="save-button"
        additionalClassCancelButton="restore-button"
        saveButtonDataTestId="save_sso_settings_button"
        cancelButtonDataTestId="restore_sso_settings_button"
      />
      {confirmationResetModal ? (
        <ResetConfirmationModal
          closeResetModal={closeResetModal}
          confirmReset={confirmReset}
          confirmationResetModal={confirmationResetModal}
        />
      ) : null}
    </>
  );
};

export default inject(({ ssoStore, currentQuotaStore }) => {
  const {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    isLoadingXml,
    closeResetModal,
    confirmReset,
    isDisabledSaveButton,
  } = ssoStore;
  const { isSSOAvailable } = currentQuotaStore;

  return {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    isLoadingXml,
    isSSOAvailable,
    closeResetModal,
    confirmReset,
    isDisabledSaveButton,
  };
})(observer(SubmitResetButtons));
