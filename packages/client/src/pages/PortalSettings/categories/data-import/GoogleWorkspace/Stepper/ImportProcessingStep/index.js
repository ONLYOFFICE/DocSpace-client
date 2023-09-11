import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/components/utils/device";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import ProgressBar from "@docspace/components/progress-bar";
import Button from "@docspace/components/button";

const Wrapper = styled.div`
  max-width: 350px;

  @media ${tablet} {
    .cancel-button {
      width: 100px;
      height: 40px;
      font-size: 14px;
    }
  }

  .data-import-progress-bar {
    margin-top: -8px;
    margin-bottom: 16px;
  }
`;

const PERCENT_STEP = 5;

const ImportProcessingStep = ({
  t,
  onNextStep,
  isFifthStep,
  isFileLoading,
  setIsFileLoading,
  migrationFile,
  data,
}) => {
  const [isVisble, setIsVisble] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);

  useEffect(() => {
    try {
      const interval = setInterval(() => {
        if (percentRef.current < 100) {
          setIsFileLoading(true);
          setPercent((prev) => prev + PERCENT_STEP);
          percentRef.current += PERCENT_STEP;
        } else {
          clearInterval(interval);
          setIsFileLoading(false);
          onNextStep();
        }
      }, 1000);
      migrationFile(data);
    } catch (error) {
      console.log(error);
      setIsFileLoading(false);
    }
  }, []);

  const onCancel = () => {
    setIsVisble(true);
    setPercent(0);
    setIsFileLoading(false);
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
          isFifthStep={isFifthStep}
          onClose={() => setIsVisble(false)}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    data,
    initMigrationName,
    getMigrationStatus,
    isFileLoading,
    setIsFileLoading,
    migrationFile,
  } = importAccountsStore;

  return {
    data,
    getMigrationStatus,
    initMigrationName,
    isFileLoading,
    setIsFileLoading,
    migrationFile,
  };
})(observer(ImportProcessingStep));
