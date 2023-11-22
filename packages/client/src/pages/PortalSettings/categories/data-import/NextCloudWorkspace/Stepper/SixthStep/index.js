import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { Wrapper } from "../StyledStepper";

import ProgressBar from "@docspace/components/progress-bar";
import Button from "@docspace/components/button";

const SixthStep = ({
  t,
  incrementStep,
  isSixthStep,
  setIsLoading,
  proceedFileMigration,
  cancelMigration,
  importOptions,
  finalUsers,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [percent, setPercent] = useState(0);

  const handleFileMigration = async () => {
    try {
      await proceedFileMigration({
        users: finalUsers,
        migratorName: "Nextcloud",
        ...importOptions,
      });

      setPercent(100);
      setIsLoading(false);
      incrementStep();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const hideCancelDialog = () => setIsVisible(false);

  const onCancel = () => {
    setIsVisible(true);
    setIsLoading(false);
  };

  useEffect(() => {
    handleFileMigration();
  }, []);

  return (
    <Wrapper>
      {percent < 100 && (
        <>
          <ProgressBar percent={percent} className="data-import-progress-bar" />
          <Button
            size="small"
            className="cancel-button"
            label={t("Common:CancelButton")}
            onClick={onCancel}
          />
        </>
      )}

      {isVisible && (
        <CancelUploadDialog
          visible={isVisible}
          loading={false}
          isSixthStep={isSixthStep}
          cancelMigration={cancelMigration}
          onClose={hideCancelDialog}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const { setIsLoading, proceedFileMigration, cancelMigration, importOptions, finalUsers } =
    importAccountsStore;

  return {
    importOptions,
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    finalUsers,
  };
})(observer(SixthStep));
