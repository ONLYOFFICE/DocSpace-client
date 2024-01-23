import { useState } from "react";
import { HexColorInput } from "react-colorful";

import { Wrapper, InputWrapper, ColorBlock } from "./ColorInput.styled";
import { DropDownItem } from "../drop-down-item";
import { DropDown } from "../drop-down";

import { ColorInputProps } from "./ColorInput.types";
import { ColorPicker } from "../color-picker";

const ColorInput = ({
  className,
  id,
  handleChange,
  defaultColor,
  size,
  scale,
  isDisabled,
  hasError,
  hasWarning,
}: ColorInputProps) => {
  const [color, setColor] = useState(defaultColor || "#4781D1");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const closePicker = () => setIsPickerOpen(false);
  const togglePicker = () => setIsPickerOpen((isOpen) => !isOpen);

  const onChange = (value: string) => {
    handleChange?.(value);
    setColor(value);
  };
  return (
    <Wrapper
      className={className}
      id={id}
      size={size}
      scale={scale}
      isDisabled={isDisabled}
      hasError={hasError}
      hasWarning={hasWarning}
    >
      <InputWrapper scale={scale}>
        <HexColorInput
          className="hex-value"
          prefixed
          color={color.toUpperCase()}
          onChange={onChange}
        />
        <ColorBlock
          color={color}
          onClick={togglePicker}
          isDisabled={isDisabled}
        />
      </InputWrapper>

      <DropDown
        directionX="left"
        manualY="48px"
        withBackdrop
        isDefaultMode={false}
        open={isPickerOpen}
        clickOutsideAction={closePicker}
      >
        <DropDownItem className="drop-down-item-hex">
          <ColorPicker
            appliedColor={color}
            handleChange={onChange}
            isPickerOnly
          />
        </DropDownItem>
      </DropDown>
    </Wrapper>
  );
};

export { ColorInput };
