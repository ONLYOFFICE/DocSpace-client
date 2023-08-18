import SelectFileStep from "./SelectFileStep";
import SelectUsersStep from "./SelectUsersStep";
import SelectUsersTypeStep from "./SelectUsersTypeStep";
import ImportStep from "./ImportStep";
import ImportProcessingStep from "./ImportProcessingStep";
import ImportCompleteStep from "./ImportCompleteStep";

const StepContent = ({
  t,
  currentStep,
  showReminder,
  setShowReminder,
  onNextStep,
  onPrevStep,
}) => {
  const isFifthStep = currentStep === 5;

  switch (currentStep) {
    case 1:
      return (
        <SelectFileStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          setShowReminder={setShowReminder}
        />
      );
    case 2:
      return (
        <SelectUsersStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    case 3:
      return (
        <SelectUsersTypeStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    case 4:
      return (
        <ImportStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    case 5:
      return (
        <ImportProcessingStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          isFifthStep={isFifthStep}
        />
      );
    case 6:
      return (
        <ImportCompleteStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    default:
      break;
  }
};

export default StepContent;
