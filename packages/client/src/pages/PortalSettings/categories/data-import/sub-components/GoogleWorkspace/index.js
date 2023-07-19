import { useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

import FileUpload from "./FileUpload";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

import { WorkspaceWrapper } from "../../StyledDataImport";

const GoogleWorkspace = (props) => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = props;

  const steps = [1, 2, 3, 4, 5, 6];

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return <FileUpload t={t} setShowReminder={setShowReminder} />;
      case 2:
        return <Text>2 Step</Text>;
      case 3:
        return <Text>3 Step</Text>;
      case 4:
        return <Text>4 Step</Text>;
      case 5:
        return <Text>5 Step</Text>;
      case 6:
        return <Text>6 Step</Text>;
      default:
        break;
    }
  };

  const isFirstStep = currentStep === 1;

  const saveButtonText = isFirstStep
    ? t("Settings:UploadToServer")
    : t("Settings:NextStep");

  const onSaveClick = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const onCancelClick = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (isMobile)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  return (
    <WorkspaceWrapper>
      <Text className="data-import-description">
        {t("Settings:AboutDataImport")}
      </Text>
      <Box displayProp="flex" marginProp="0 0 8px">
        <Text className="step-counter">
          {currentStep}/{steps.length}.
        </Text>
        <Text isBold fontSize="16px">
          {t("Common:SelectFile")}
        </Text>
      </Box>
      <Box className="content-wrapper">
        {getStepContent(currentStep)}
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onSaveClick}
          onCancelClick={onCancelClick}
          showReminder={showReminder}
          saveButtonLabel={saveButtonText}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      </Box>
    </WorkspaceWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(GoogleWorkspace)));
