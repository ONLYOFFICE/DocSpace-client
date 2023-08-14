import { useState, useEffect } from "react";
import { Trans, withTranslation } from "react-i18next";
import { isMobileOnly, isDesktop } from "react-device-detect";
import { getStepTitle, getStepDescription } from "../../../utils";
import styled from "styled-components";

import StepContent from "./Stepper";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import HelpButton from "@docspace/components/help-button";

const STEP_LENGTH = 6;

const GoogleWrapper = styled.div`
  margin-top: 4px;

  .data-import-subtitle {
    color: #657077;
    max-width: 700px;
    line-height: 20px;
    margin-bottom: 20px;
  }

  .stepper {
    margin-right: 5px;
    font-weight: 700;
    font-size: 16px;
  }

  .step-description {
    position: relative;
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: #333333;
  }

  .step-tooltip {
    position: absolute;
    top: 18px;
    right: 45%;
  }
`;

const GoogleWorkspace = (props) => {
  const [showReminder, setShowReminder] = useState(false);
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = props;

  const isSecondStep = currentStep === 2;
  const isThirdStep = currentStep === 3;

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

  const onNextStep = () => {
    if (currentStep !== 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onPrevStep = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

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
    <GoogleWrapper>
      <Text className="data-import-subtitle">
        {t("Settings:AboutDataImport")}
      </Text>
      <>
        <Box displayProp="flex" marginProp="0 0 8px">
          <Text className="stepper">
            {currentStep}/{STEP_LENGTH}.
          </Text>
          <Text isBold fontSize="16px">
            {getStepTitle(t, currentStep)}
          </Text>
        </Box>
        <Text className="step-description">
          {getStepDescription(t, currentStep)}
          {isThirdStep && renderTooltip}
        </Text>
        <StepContent
          t={t}
          currentStep={currentStep}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          setShowReminder={setShowReminder}
        />
      </>
      {isSecondStep || isThirdStep ? (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStep}
          onCancelClick={onPrevStep}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      ) : (
        <></>
      )}
    </GoogleWrapper>
  );
};

export default withTranslation(["Common, Settings"])(GoogleWorkspace);
