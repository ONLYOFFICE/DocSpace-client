import React, { useState } from "react";
import styled from "styled-components";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";

import { isMobile } from "react-device-detect";

import { getStepsData } from "./Stepper";

const NextcloudWrapper = styled.div`
  max-width: 700px;

  .data-import-description {
    margin-top: 3px;
  }

  .data-import-counter {
    margin-top: 19px;
    margin-bottom: 8px;
  }

  .data-import-section-description {
    margin-bottom: 16px;
    font-size: 12px;
  }

  .sections-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .save-cancel-buttons {
    margin-top: 22px;
  }
`;

const NextcloudWorkspace = (props) => {
  const { t, tReady } = props;

  const [currentStep, setCurrentStep] = useState(0);

  const StepsData = getStepsData(t, currentStep, setCurrentStep);

  if (isMobile) return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  if (!tReady) return;

  return (
    <NextcloudWrapper>
      <Text className="data-import-description" lineHeight="20px" color="#657077">
        {t("Settings:AboutDataImport")}
      </Text>
      <Text className="data-import-counter" fontSize="16px" fontWeight={700} lineHeight="22px">
        {currentStep + 1}/{StepsData.length}. {StepsData[currentStep].title}
      </Text>
      <Text className="data-import-section-description" lineHeight="16px">
        {StepsData[currentStep].description}
      </Text>
      {StepsData[currentStep].component}
    </NextcloudWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(NextcloudWorkspace)));
