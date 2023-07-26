import Button from "@docspace/components/button";

const SixthStep = ({ t, onNextStepClick, onPrevStepClick, showReminder }) => {
  return (
    <Button
      primary
      size="small"
      className="finish-button"
      label={t("Common:Finish")}
      onClick={onNextStepClick}
    />
  );
};

export default SixthStep;
