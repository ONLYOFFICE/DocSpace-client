import { useState, useEffect } from "react";
import { Trans, withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobileOnly, isDesktop } from "react-device-detect";

import FirstStep from "./Stepper/FirstStep";
import SecondStep from "./Stepper/SecondStep";
import ThirdStep from "./Stepper/ThirdStep";
import FourthStep from "./Stepper/FourthStep";
import FifthStep from "./Stepper/FifthStep";
import SixthStep from "./Stepper/SixthStep";

import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";
import Box from "@docspace/components/box";

import { getStepTitle, getStepDescription } from "../../../utils";
import { WorkspaceWrapper } from "../StyledDataImport";

const GoogleWorkspace = (props) => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const { t } = props;

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => {
      window.removeEventListener("resize", onCheckView);
    };
  }, []);

  const onCheckView = () => {
    if (isDesktop && window.innerWidth < 600) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

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
      case 4:
        return (
          <FourthStep
            t={t}
            onNextStepClick={onNextStepClick}
            onPrevStepClick={onPrevStepClick}
            showReminder={showReminder}
          />
        );
      case 5:
        return (
          <FifthStep
            t={t}
            onNextStepClick={onNextStepClick}
            onPrevStepClick={onPrevStepClick}
            showReminder={showReminder}
            isFifthStep={isFifthStep}
          />
        );
      case 6:
        return (
          <SixthStep
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
  const isFifthStep = currentStep === 5;

  const renderTooltip = (
    <HelpButton
      className="step-tooltip"
      offsetRight={0}
      size={12}
      tooltipContent={
        <Text fontSize="12px">
          <Trans
            i18nKey="TypesAndPrivileges"
            ns="Settings"
            t={t}
            components={{
              1: <strong></strong>,
              2: <strong></strong>,
              3: <strong></strong>,
              4: <strong></strong>,
            }}
          />
        </Text>
      }
    />
  );

  if (isSmallWindow)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;
  if (isMobileOnly)
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
          {isThirdStep && renderTooltip}
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
