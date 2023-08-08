import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import ProgressBar from "@docspace/components/progress-bar";
import Text from "@docspace/components/text";
import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 350px;

  .data-import-progress-text {
    position: relative;
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 8px;
    line-height: 16px;
    color: #333333;
  }

  .data-import-progress-bar {
    margin-bottom: 16px;
  }
`;

const FifthStep = ({ t, onNextStepClick, onPrevStepClick, showReminder }) => {
  return (
    <Wrapper>
      <Text className="data-import-progress-text">
        {t("Settings:DataImportProcessingDescription")}
      </Text>
      <ProgressBar percent={75} className="data-import-progress-bar" />
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStepClick}
        onCancelClick={onPrevStepClick}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </Wrapper>
  );
};

export default FifthStep;
