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
