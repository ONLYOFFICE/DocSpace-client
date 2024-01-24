import { useEffect, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

import { Button } from "../button";

import Wrapper from "./ColorPicker.styled";
import { ColorPickerProps } from "./ColorPicker.types";
import { ButtonSize } from "../button/Button.enums";

const ColorPicker = ({
  className,
  id,
  onClose,
  onApply,
  appliedColor,
  applyButtonLabel,
  cancelButtonLabel,
  isPickerOnly,
  handleChange,
}: ColorPickerProps) => {
  const [color, setColor] = useState(appliedColor || "#4781D1");

  useEffect(() => {
    if (!isPickerOnly && appliedColor && appliedColor !== color) {
      setColor(appliedColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedColor]);

  return (
    <Wrapper className={className} id={id}>
      <div className="hex-color-picker">
        {!isPickerOnly && (
          <div className="hex-value-container">
            <div className="hex-value-label">Hex code:</div>

            <HexColorInput
              className="hex-value"
              prefixed
              color={color.toUpperCase()}
              onChange={setColor}
            />
          </div>
        )}

        <HexColorPicker
          color={
            isPickerOnly ? appliedColor.toUpperCase() : color.toUpperCase()
          }
          onChange={isPickerOnly ? handleChange : setColor}
        />

        {!isPickerOnly && (
          <div className="hex-button">
            <Button
              label={applyButtonLabel}
              size={ButtonSize.small}
              className="apply-button"
              primary
              scale
              onClick={() => onApply(color)}
            />
            <Button
              label={cancelButtonLabel}
              className="cancel-button button"
              size={ButtonSize.small}
              scale
              onClick={onClose}
            />
          </div>
        )}
      </div>
    </Wrapper>
  );
};

ColorPicker.defaultProps = {
  isPickerOnly: false,
  onClose: () => {},
  onApply: () => {},
  appliedColor: "#4781D1",
  applyButtonLabel: "Apply",
  cancelButtonLabel: "Cancel",
};

export { ColorPicker };
