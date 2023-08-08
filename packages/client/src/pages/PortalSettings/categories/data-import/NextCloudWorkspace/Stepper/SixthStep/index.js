import React, { useState, useRef, useEffect } from "react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import ProgressBar from "@docspace/components/progress-bar";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import Button from "@docspace/components/button";

import { Wrapper } from "../StyledStepper";

const SixthStep = ({ t, incrementStep, decrementStep }) => {
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);

  const PERCENT_STEP = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      if (percentRef.current < 100) {
        setPercent((prevPercent) => prevPercent + PERCENT_STEP);
        percentRef.current += PERCENT_STEP;
      } else {
        clearInterval(interval);
        incrementStep();
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const onClickButton = () => {
    setIsCancelVisible(true);
  };

  return (
    <Wrapper>
      {percent < 100 ? (
        <>
          <ProgressBar percent={percent} className="data-import-progress-bar" />
          <Button size="small" label={t("Common:CancelButton")} onClick={onClickButton} />
        </>
      ) : (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={incrementStep}
          onCancelClick={decrementStep}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings
          showReminder
        />
      )}

      {isCancelVisible && (
        <CancelUploadDialog
          visible={isCancelVisible}
          loading={false}
          onClose={() => setIsCancelVisible(false)}
        />
      )}
    </Wrapper>
  );
};

export default SixthStep;
