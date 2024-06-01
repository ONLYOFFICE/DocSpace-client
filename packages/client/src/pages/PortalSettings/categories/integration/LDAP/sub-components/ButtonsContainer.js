import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { Box } from "@docspace/shared/components/box";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

const ButtonContainer = ({
  saveLdapSettings,
  restoreToDefault,
  isLdapEnabled,
  isLdapAvailable,
  hasChanges,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = () => {
    saveLdapSettings().catch((e) => toastr.error(e));
  };
  const onResetClick = () => {
    restoreToDefault().catch((e) => toastr.error(e));
  };

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
        saveButtonDisabled={!isLdapAvailable || !isLdapEnabled || !hasChanges}
        cancelEnable
        showReminder
        additionalClassSaveButton="ldap-save"
        additionalClassCancelButton="ldap-reset"
      />
    </Box>
  );
};

export default inject(({ currentQuotaStore, ldapStore }) => {
  const { save, restoreToDefault, isLdapEnabled, hasChanges } = ldapStore;
  const { isLdapAvailable } = currentQuotaStore;

  return {
    saveLdapSettings: save,
    restoreToDefault,
    isLdapEnabled,
    isLdapAvailable,
    hasChanges,
  };
})(observer(ButtonContainer));
