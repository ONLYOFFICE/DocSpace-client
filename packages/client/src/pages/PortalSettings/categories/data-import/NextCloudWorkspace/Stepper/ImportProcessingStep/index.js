import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isTablet } from "@docspace/shared/utils/device";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { Wrapper } from "../StyledStepper";

import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { Button } from "@docspace/shared/components/button";

const ImportProcessingStep = ({
  t,
  incrementStep,
  isSixthStep,
  setIsLoading,
  proceedFileMigration,
  cancelMigration,
  getMigrationStatus,
  setImportResult,
}) => {
  // const [isVisible, setIsVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const uploadInterval = useRef(null);

  const handleFileMigration = async () => {
    try {
      await proceedFileMigration("Nextcloud");

      uploadInterval.current = setInterval(async () => {
        const res = await getMigrationStatus();

        setPercent(res.progress);

        if (res.isCompleted) {
          clearInterval(uploadInterval.current);
          setIsLoading(false);
          setImportResult(res.parseResult);
          incrementStep();
        }
      }, 1000);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // const hideCancelDialog = () => setIsVisible(false);

  // const onCancel = () => {
  //   setIsVisible(true);
  // };

  // const handleCancelMigration = () => {
  //   setIsLoading(false);
  //   cancelMigration();
  // }

  useEffect(() => {
    handleFileMigration();
  }, []);

  return (
    <Wrapper>
      <ProgressBar percent={percent} className="data-import-progress-bar" />
      {/* <Button
        size={isTablet() ? "medium" : "small"}
        className="cancel-button"
        label={t("Common:CancelButton")}
        onClick={onCancel}
      />

      {isVisible && (
        <CancelUploadDialog
          visible={isVisible}
          loading={false}
          isSixthStep={isSixthStep}
          cancelMigration={handleCancelMigration}
          onClose={hideCancelDialog}
        />
      )} */}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    getMigrationStatus,
    setImportResult,
  } = importAccountsStore;

  return {
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    getMigrationStatus,
    setImportResult,
  };
})(observer(ImportProcessingStep));
