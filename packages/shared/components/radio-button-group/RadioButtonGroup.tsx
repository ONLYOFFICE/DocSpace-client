import React from "react";

import { RadioButton } from "../radio-button";
import { Text } from "../text";

import StyledDiv from "./RadioButtonGroup.styled";
import {
  RadioButtonGroupProps,
  TRadioButtonOption,
} from "./RadioButtonGroup.types";

const RadioButtonGroup = ({
  id,
  className,
  style,
  orientation = "horizontal",
  width,
  options,
  name,
  selected,
  fontSize,
  fontWeight,
  onClick,
  isDisabled,
  spacing,
}: RadioButtonGroupProps) => {
  const [selectedOption, setSelectedOption] = React.useState(selected);

  const handleOptionChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log("call");
    setSelectedOption(changeEvent.target.value);
  };

  console.log(selectedOption);

  React.useEffect(() => {
    setSelectedOption(selected);
  }, [selected]);

  return (
    <StyledDiv
      id={id}
      className={className}
      style={style}
      orientation={orientation}
      width={width}
      data-testid="radio-button-group"
    >
      {options.map((option: TRadioButtonOption) => {
        if (option.type === "text")
          return (
            <Text key="radio-text" className="subtext">
              {option.label}
            </Text>
          );

        return (
          <RadioButton
            id={option.id}
            key={option.value}
            name={name || ""}
            value={option.value}
            isChecked={`${selectedOption}` === `${option.value}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleOptionChange(e);
              onClick(e);
            }}
            isDisabled={isDisabled || option.disabled}
            label={option.label}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
            orientation={orientation}
          />
        );
      })}
    </StyledDiv>
  );
};

export { RadioButtonGroup };
