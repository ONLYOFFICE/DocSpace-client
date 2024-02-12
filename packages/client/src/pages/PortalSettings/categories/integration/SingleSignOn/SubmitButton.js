import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import ResetConfirmationModal from "./sub-components/ResetConfirmationModal";

const SubmitResetButtons = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Settings", "Common"]);
  const {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    hasErrors,
    hasChanges,
    isLoadingXml,
  } = props;

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={() => saveSsoSettings(t)}
        onCancelClick={isSsoEnabled ? openResetModal : resetForm}
        showReminder={true}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings={true}
        hasScroll={true}
        isSaving={isSubmitLoading}
        saveButtonDisabled={
          !isSsoEnabled || hasErrors || !hasChanges || isLoadingXml
        }
        cancelEnable={!(isSubmitLoading || isLoadingXml)}
        additionalClassSaveButton="save-button"
        additionalClassCancelButton="restore-button"
      />
      {confirmationResetModal && <ResetConfirmationModal />}
    </>
  );
};

export default inject(({ ssoStore }) => {
  const {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    hasErrors,
    hasChanges,
    isLoadingXml,
  } = ssoStore;

  return {
    saveSsoSettings,
    isSsoEnabled,
    openResetModal,
    resetForm,
    confirmationResetModal,
    isSubmitLoading,
    hasErrors,
    hasChanges,
    isLoadingXml,
  };
})(observer(SubmitResetButtons));
