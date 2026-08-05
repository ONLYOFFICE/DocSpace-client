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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";

import ResetConfirmationModal from "SRC_DIR/components/dialogs/ResetConfirmationDialog/ResetConfirmationModal";
import ProgressContainer from "./ProgressContainer";

const ButtonContainer = ({
  saveLdapSettings,
  restoreToDefault,
  hasChanges,
  isDefaultSettings,

  isLdapEnabled,
  isUIDisabled,

  isMobileView,

  hasProgressError,

  confirmationResetModal,
  closeResetModal,
  openResetModal,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const onSaveClick = React.useCallback(() => {
    setIsSubmitLoading(true);
    saveLdapSettings(t)
      .catch((e) => toastr.error(e))
      .finally(() => {
        setIsSubmitLoading(false);
      });
  }, [saveLdapSettings, t]);

  const onResetClick = React.useCallback(() => {
    setIsSubmitLoading(true);
    closeResetModal();
    restoreToDefault(t)
      .catch((e) => toastr.error(e))
      .finally(() => {
        setIsSubmitLoading(false);
      });
  }, [restoreToDefault, t]);

  const getTopComponent = React.useCallback(() => {
    return (
      isMobileView && (
        <ProgressContainer operation={LDAPOperation.SaveAndSync} />
      )
    );
  }, [isMobileView]);

  const saveDisabled =
    (isSubmitLoading || !isLdapEnabled || isUIDisabled || !hasChanges) &&
    !hasProgressError;
  const resetDisabled =
    isSubmitLoading || !isLdapEnabled || isUIDisabled || isDefaultSettings;

  return (
    <div className="ldap_buttons-container">
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={openResetModal}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings
        hasScroll
        hideBorder
        saveButtonDisabled={saveDisabled}
        disableRestoreToDefault={resetDisabled}
        additionalClassSaveButton="ldap-save"
        additionalClassCancelButton="ldap-reset"
        showReminder={null}
        getTopComponent={getTopComponent}
      />
      {confirmationResetModal ? (
        <ResetConfirmationModal
          closeResetModal={closeResetModal}
          confirmReset={onResetClick}
          confirmationResetModal={confirmationResetModal}
        />
      ) : null}
    </div>
  );
};

export default inject(({ settingsStore, ldapStore }) => {
  const {
    save,
    restoreToDefault,
    hasChanges,
    isDefaultSettings,

    isLdapEnabled,
    isUIDisabled,

    progressStatus,
    confirmationResetModal,
    closeResetModal,
    openResetModal,
  } = ldapStore;

  const { currentDeviceType } = settingsStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const { error } = progressStatus;

  return {
    saveLdapSettings: save,
    restoreToDefault,
    hasChanges,
    isDefaultSettings,

    isLdapEnabled,
    isUIDisabled,

    isMobileView,
    hasProgressError: !!error,

    confirmationResetModal,
    closeResetModal,
    openResetModal,
  };
})(observer(ButtonContainer));
