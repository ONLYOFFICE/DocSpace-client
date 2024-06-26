import { DeviceType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { StyledButtonContainer } from "../ClientForm.styled";

interface ButtonsBlockProps {
  saveLabel: string;
  cancelLabel: string;

  isRequestRunning: boolean;

  saveButtonDisabled: boolean;
  cancelButtonDisabled: boolean;

  onSaveClick: () => void;
  onCancelClick: () => void;

  currentDeviceType: string;
}

const ButtonsBlock = ({
  saveLabel,
  cancelLabel,
  isRequestRunning,
  saveButtonDisabled,
  cancelButtonDisabled,
  onSaveClick,
  onCancelClick,
  currentDeviceType,
}: ButtonsBlockProps) => {
  const isDesktop = currentDeviceType === DeviceType.desktop;

  const buttonSize = isDesktop ? ButtonSize.small : ButtonSize.normal;
  return (
    <StyledButtonContainer>
      <Button
        label={saveLabel}
        isLoading={isRequestRunning}
        isDisabled={saveButtonDisabled}
        primary
        size={buttonSize}
        scale={!isDesktop}
        onClick={onSaveClick}
      />

      <Button
        label={cancelLabel}
        isDisabled={cancelButtonDisabled}
        size={buttonSize}
        scale={!isDesktop}
        onClick={onCancelClick}
      />
    </StyledButtonContainer>
  );
};

export default ButtonsBlock;
