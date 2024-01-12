import { inject, observer } from "mobx-react";
import { FileInput } from "@docspace/shared/components/file-input";

const LocalFile = ({ setRestoreResource, isEnableRestore, t }) => {
  const onClickInput = (file) => {
    setRestoreResource(file);
  };

  return (
    <FileInput
      onInput={onClickInput}
      scale
      className="restore-backup_input"
      isDisabled={!isEnableRestore}
      accept={[".tar", ".gz"]}
    />
  );
};

export default inject(({ auth, backup }) => {
  const { currentQuotaStore } = auth;
  const { setRestoreResource } = backup;
  const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;

  return {
    isEnableRestore: isRestoreAndAutoBackupAvailable,
    setRestoreResource,
  };
})(observer(LocalFile));
