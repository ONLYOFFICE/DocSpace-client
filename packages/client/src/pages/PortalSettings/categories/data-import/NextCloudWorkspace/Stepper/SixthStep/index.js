import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const SixthStep = ({ t, incrementStep, decrementStep }) => {
  return (
    <SaveCancelButtons
      className="save-cancel-buttons"
      onSaveClick={incrementStep}
      onCancelClick={decrementStep}
      saveButtonLabel={t("Settings:NextStep")}
      cancelButtonLabel={t("Common:Back")}
      displaySettings
      showReminder
    />
  );
};

export default SixthStep;
