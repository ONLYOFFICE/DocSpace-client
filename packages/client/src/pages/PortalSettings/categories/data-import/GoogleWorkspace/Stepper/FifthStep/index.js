import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const FifthStep = ({ t, onNextStepClick, onPrevStepClick, showReminder }) => {
  return (
    <SaveCancelButtons
      className="save-cancel-buttons"
      onSaveClick={onNextStepClick}
      onCancelClick={onPrevStepClick}
      showReminder={showReminder}
      saveButtonLabel={t("Settings:NextStep")}
      cancelButtonLabel={t("Common:Back")}
      displaySettings={true}
    />
  );
};

export default FifthStep;
