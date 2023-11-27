import { useState, useEffect } from "react";
import { Trans, withTranslation } from "react-i18next";
import { isMobileOnly, isDesktop } from "react-device-detect";
import { getStepTitle, getWorkspaceStepDescription } from "../../../utils";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import StepContent from "./Stepper";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import HelpButton from "@docspace/components/help-button";

const STEP_LENGTH = 6;

const WorkspaceWrapper = styled.div`
  margin-top: 4px;

  .workspace-subtitle {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    max-width: 700px;
    line-height: 20px;
    margin-bottom: 20px;

    @media ${tablet} {
      max-width: 675px;
    }
  }

  .step-counter {
    margin-right: 5px;
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-title {
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-description {
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: ${(props) =>
      props.theme.client.settings.migration.stepDescriptionColor};

    @media ${tablet} {
      max-width: 675px;
    }
  }
`;

const OnlyofficeWorkspace = ({ t }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const helpContent = () => (
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
  );

  const renderTooltip = (
    <HelpButton
      place="bottom"
      offsetRight={0}
      getContent={helpContent}
      style={{
        display: "inline-block",
        position: "relative",
        bottom: "-2px",
        marginLeft: "4px",
      }}
    />
  );

  if (isSmallWindow)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;
  if (isMobileOnly)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  return (
    <WorkspaceWrapper>
      <Text className="workspace-subtitle">
        {t("Settings:AboutDataImport")}
      </Text>
      <div className="step-container">
        <Box displayProp="flex" marginProp="0 0 8px">
          <Text className="step-counter">
            {currentStep}/{STEP_LENGTH}.
          </Text>
          <Text className="step-title">{getStepTitle(t, currentStep)}</Text>
        </Box>
        <Text className="step-description">
          {getWorkspaceStepDescription(t, currentStep, renderTooltip)}
        </Text>
        <StepContent
          t={t}
          currentStep={currentStep}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          setShowReminder={setShowReminder}
        />
      </div>
    </WorkspaceWrapper>
  );
};

export default withTranslation(["Common", "Settings"])(OnlyofficeWorkspace);
