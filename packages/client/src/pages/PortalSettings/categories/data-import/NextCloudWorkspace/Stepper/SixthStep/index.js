import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { Wrapper } from "../StyledStepper";

import ProgressBar from "@docspace/components/progress-bar";
import Button from "@docspace/components/button";

const PERCENT_STEP = 5;

const SixthStep = ({
  t,
  incrementStep,
  isSixthStep,
  setIsLoading,
  proceedFileMigration,
  cancelMigration,
  importOptions,
  users,
}) => {
  const [isVisble, setIsVisble] = useState(false);
  const [percent, setPercent] = useState(0);

  const handleFileMigration = async () => {
    try {
      await proceedFileMigration({ users, migratorName: "Nextcloud", ...importOptions });

      setPercent(100);
      setIsLoading(false);
      incrementStep();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFileMigration();
  }, []);

  const onCancel = () => {
    setIsVisble(true);
    setIsLoading(false);
  };

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

      {isVisble && (
        <CancelUploadDialog
          visible={isVisble}
          loading={false}
          isSixthStep={isSixthStep}
          cancelMigration={cancelMigration}
          onClose={() => setIsVisble(false)}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const { setIsLoading, proceedFileMigration, cancelMigration, importOptions, users } =
    importAccountsStore;

  return {
    importOptions,
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    users,
  };
})(observer(SixthStep));
