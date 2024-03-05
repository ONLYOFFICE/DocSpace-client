import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { FilesSelectorFilterTypes } from "@docspace/shared/enums";

import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";

const RoomsModule = (props) => {
  const { isEnableRestore, setRestoreResource } = props;

  const { t } = useTranslation("Settings");

  const onSelectFile = (file) => {
    setRestoreResource(file.id);
  };

  return (
    <FilesSelectorInput
      className="restore-backup_input"
      isDisabled={!isEnableRestore}
      onSelectFile={onSelectFile}
      filterParam={FilesSelectorFilterTypes.BackupOnly}
      descriptionText={t("SelectFileInGZFormat")}
    />
  );
};

export default inject(({ currentQuotaStore, backup }) => {
  const { setRestoreResource } = backup;
  const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;

  return {
    setRestoreResource,
    isEnableRestore: isRestoreAndAutoBackupAvailable,
  };
})(observer(RoomsModule));
