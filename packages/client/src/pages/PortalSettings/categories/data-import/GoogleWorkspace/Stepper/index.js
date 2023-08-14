import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";

const StepContent = ({
  t,
  currentStep,
  showReminder,
  setShowReminder,
  onNextStepClick,
  onPrevStepClick,
}) => {
  const isFifthStep = currentStep === 5;

  switch (currentStep) {
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

export default StepContent;
