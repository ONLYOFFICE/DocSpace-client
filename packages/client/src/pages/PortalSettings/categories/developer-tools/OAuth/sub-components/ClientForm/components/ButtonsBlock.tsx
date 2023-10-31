import React from "react";

import Button from "@docspace/components/button";
import { StyledButtonContainer } from "../ClientForm.styled";
import { DeviceType } from "@docspace/common/constants";

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

  const buttonSize = isDesktop ? "small" : "normal";
  return (
    <StyledButtonContainer>
      <Button
        // @ts-ignore
        label={saveLabel}
        isLoading={isRequestRunning}
        isDisabled={saveButtonDisabled}
        primary
        size={buttonSize}
        scale={!isDesktop}
        onClick={onSaveClick}
      />

      <Button
        // @ts-ignore
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
