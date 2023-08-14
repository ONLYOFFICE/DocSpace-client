import SelectFileStep from "./SelectFileStep";
import SelectUsersStep from "./SelectUsersStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";

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
        <ThirdStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    case 4:
      return (
        <FourthStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
        />
      );
    case 5:
      return (
        <FifthStep
          t={t}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          isFifthStep={isFifthStep}
        />
      );
    case 6:
      return (
        <SixthStep
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
