import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isTablet } from "@docspace/shared/utils/device";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

const Wrapper = styled.div`
  max-width: 350px;

  .data-import-progress-bar {
    margin-top: -8px;
    margin-bottom: 16px;
  }
`;

const ImportProcessingStep = ({
  t,
  onNextStep,
  isFifthStep,
  setIsLoading,
  proceedFileMigration,
  cancelMigration,
  getMigrationStatus,
}) => {
  const [percent, setPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const uploadInterval = useRef(null);

  const handleFileMigration = async () => {
    try {
      await proceedFileMigration("GoogleWorkspace");

      uploadInterval.current = setInterval(async () => {
        const res = await getMigrationStatus();
        setPercent(res.progress);

        if (res.progress > 10) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        if (res.isCompleted || res.progress === 100) {
          clearInterval(uploadInterval.current);
          setIsLoading(false);
          onNextStep();
        }
      }, 1000);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toastr.error(error);
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

    return () => clearInterval(uploadInterval.current);
  }, []);

  return (
    <Wrapper>
      <ProgressBar
        percent={percent}
        isInfiniteProgress={isVisible}
        className="data-import-progress-bar"
      />
      {/* <Button
        size={isTablet() ? "medium" : "small"}
        label={t("Common:CancelButton")}
        onClick={onCancel}
      />

      {isVisible && (
        <CancelUploadDialog
          visible={isVisible}
          loading={false}
          isFifthStep={isFifthStep}
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
  } = importAccountsStore;

  return {
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    getMigrationStatus,
  };
})(observer(ImportProcessingStep));
