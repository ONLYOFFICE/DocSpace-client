import React from "react";
import { motion } from "framer-motion";

import { Text } from "../text";

import ToggleButtonTheme from "./ToggleButton.theme";
import { ToggleButtonContainer, HiddenInput } from "./ToggleButton.styled";
import { ToggleButtonProps, ToggleIconProps } from "./ToggleButton.types";

const ToggleIcon = ({
  isChecked,
  isLoading,
  noAnimation = false,
}: ToggleIconProps) => {
  const transition = noAnimation ? { duration: 0 } : {};

  return (
    <motion.svg
      animate={[
        isChecked ? "checked" : "notChecked",
        isLoading ? "isLoading" : "",
      ]}
      width="28"
      height="16"
      viewBox="0 0 28 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.rect width="28" height="16" rx="8" />
      <motion.circle
        fill-rule="evenodd"
        clip-rule="evenodd"
        cy="8"
        variants={{
          isLoading: {
            r: [5, 6, 6],
            transition: {
              r: {
                yoyo: Infinity,
                duration: 0.6,
                ease: "easeOut",
              },
            },
          },
          checked: {
            cx: 20,
            r: 6,
            transition,
          },
          notChecked: {
            cx: 8,
            r: 6,
            transition,
          },
        }}
      />
    </motion.svg>
  );
};

const ToggleButton = ({
  label,
  isChecked,
  isDisabled,
  onChange,
  id,
  className,
  style,
  isLoading,
  noAnimation,
  name,
  fontWeight,
  fontSize,
}: ToggleButtonProps) => {
  return (
    <ToggleButtonTheme
      id={id}
      className={className}
      style={style}
      isChecked={isChecked}
      isDisabled={isDisabled}
      data-testid="toggle-button"
    >
      <ToggleButtonContainer
        id={id}
        className={className}
        style={style}
        isDisabled={isDisabled}
        isChecked={isChecked}
      >
        <HiddenInput
          name={name}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={onChange}
        />
        <ToggleIcon
          isChecked={isChecked}
          isLoading={isLoading}
          noAnimation={noAnimation || false}
        />
        {label && (
          <Text
            className="toggle-button-text"
            as="span"
            fontWeight={fontWeight}
            fontSize={fontSize}
          >
            {label}
          </Text>
        )}
      </ToggleButtonContainer>
    </ToggleButtonTheme>
  );
};

export { ToggleButton };
