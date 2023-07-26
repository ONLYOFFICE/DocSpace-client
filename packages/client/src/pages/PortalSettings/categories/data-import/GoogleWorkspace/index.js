import { useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import FirstStep from "./Stepper/FirstStep";
import SecondStep from "./Stepper/SecondStep";
import ThirdStep from "./Stepper/ThirdStep";

import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

import { getStepTitle, getStepDescription } from "../../../utils";
import { WorkspaceWrapper } from "../StyledDataImport";

const GoogleWorkspace = (props) => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = props;

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return (
          <FirstStep
            t={t}
            onNextStepClick={onNextStepClick}
            onPrevStepClick={onPrevStepClick}
            showReminder={showReminder}
            setShowReminder={setShowReminder}
          />
        );
      case 2:
        return (
          <SecondStep
            t={t}
            onNextStepClick={onNextStepClick}
            onPrevStepClick={onPrevStepClick}
            showReminder={showReminder}
          />
        );
      case 3:
        return (
          <ThirdStep
            t={t}
            onNextStepClick={onNextStepClick}
            onPrevStepClick={onPrevStepClick}
            showReminder={showReminder}
          />
        );
      default:
        break;
    }
  };

  const onNextStepClick = () => {
    if (currentStep !== 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onPrevStepClick = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isSecondStep = currentStep === 2;
  const isThirdStep = currentStep === 3;

  if (isMobile)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  return (
    <WorkspaceWrapper>
      <Text className="data-import-subtitle">
        {t("Settings:AboutDataImport")}
      </Text>
      <div className="data-import-content">
        <Box displayProp="flex" marginProp="0 0 8px">
          <Text className="stepper">
            {currentStep}/{6}.
          </Text>
          <Text isBold fontSize="16px">
            {getStepTitle(t, currentStep)}
          </Text>
        </Box>
        <Text className="step-description">
          {getStepDescription(t, currentStep)}
        </Text>
        {getStepContent(currentStep)}
      </div>
      {isSecondStep || isThirdStep ? (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStepClick}
          onCancelClick={onPrevStepClick}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      ) : (
        <></>
      )}
    </WorkspaceWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(GoogleWorkspace)));
