// (c) Copyright Ascensio System SIA 2009-2024
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

import { toastr } from "@docspace/shared/components/toast";
import { Box } from "@docspace/shared/components/box";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import ProgressContainer from "./ProgressContainer";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";

const ButtonContainer = ({
  saveLdapSettings,
  restoreToDefault,
  hasChanges,
  isDefaultSettings,

  isLdapEnabled,
  isUIDisabled,

  isMobileView,

  hasProgressError,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = React.useCallback(() => {
    saveLdapSettings(t).catch((e) => toastr.error(e));
  }, [saveLdapSettings, t]);

  const onResetClick = React.useCallback(() => {
    restoreToDefault(t).catch((e) => toastr.error(e));
  }, [restoreToDefault, t]);

  const getTopComponent = React.useCallback(() => {
    return (
      isMobileView && (
        <ProgressContainer operation={LDAPOperation.SaveAndSync} />
      )
    );
  }, [isMobileView]);

  const saveDisabled =
    (!isLdapEnabled || isUIDisabled || !hasChanges) && !hasProgressError;
  const resetDisabled = !isLdapEnabled || isUIDisabled || isDefaultSettings;

  console.log("ButtonContainer", {
    isLdapEnabled,
    isUIDisabled,
    hasChanges,
    isDefaultSettings,

    saveDisabled,
    resetDisabled,
  });

  return (
    <Box className="ldap_buttons-container">
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onResetClick}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings={true}
        hasScroll={true}
        hideBorder={true}
        saveButtonDisabled={saveDisabled}
        disableRestoreToDefault={resetDisabled}
        additionalClassSaveButton="ldap-save"
        additionalClassCancelButton="ldap-reset"
        showReminder={null}
        getTopComponent={getTopComponent}
      />
    </Box>
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
  };
})(observer(ButtonContainer));
