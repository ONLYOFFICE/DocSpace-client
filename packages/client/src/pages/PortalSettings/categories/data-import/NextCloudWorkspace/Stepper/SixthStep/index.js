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
  data,
  importOptions,
}) => {
  const [isVisble, setIsVisble] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);

  useEffect(() => {
    try {
      const interval = setInterval(() => {
        if (percentRef.current < 100) {
          setIsLoading(true);
          setPercent((prev) => prev + PERCENT_STEP);
          percentRef.current += PERCENT_STEP;
        } else {
          clearInterval(interval);
          setIsLoading(false);
          incrementStep();
        }
      }, 1000);
      proceedFileMigration({ ...data, ...importOptions });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, []);

  const onCancel = () => {
    setIsVisble(true);
    setIsLoading(false);
  };

  return (
    <Wrapper>
      {percent < 102 && (
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
  const { data, setIsLoading, proceedFileMigration, cancelMigration, importOptions } =
    importAccountsStore;

  return {
    data,
    importOptions,
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
  };
})(observer(SixthStep));
