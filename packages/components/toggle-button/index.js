import PropTypes from "prop-types";
import { motion } from "framer-motion";
import React, { Component } from "react";

import Text from "../text";

import ToggleButtonTheme from "./ToggleButton.theme";
import { ToggleButtonContainer, HiddenInput } from "./styled-toggle-button";

const ToggleIcon = ({ isChecked, isLoading, noAnimation = false }) => {
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

class ToggleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: props.isChecked,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isChecked !== prevProps.isChecked) {
      this.setState({ checked: this.props.isChecked });
    }
  }

  render() {
    const {
      isDisabled,
      label,
      onChange,
      id,
      className,
      style,
      isLoading,
      noAnimation,
      name,
      fontWeight,
      fontSize,
    } = this.props;

    //console.log("ToggleButton render");

    return (
      <ToggleButtonTheme
        id={id}
        className={className}
        style={style}
        isChecked={this.state.checked}
        isDisabled={isDisabled}
      >
        <ToggleButtonContainer
          id={id}
          className={className}
          style={style}
          isDisabled={isDisabled}
          isChecked={this.state.checked}
        >
          <HiddenInput
            name={name}
            type="checkbox"
            checked={this.state.checked}
            disabled={isDisabled}
            onChange={onChange}
          />
          <ToggleIcon
            isChecked={this.state.checked}
            isLoading={isLoading}
            noAnimation={noAnimation}
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
  }
}

ToggleButton.propTypes = {
  /** Returns the value indicating that the toggle button is enabled. */
  isChecked: PropTypes.bool.isRequired,
  /** Disables the ToggleButton */
  isDisabled: PropTypes.bool,
  /** Sets a callback function that is triggered when the ToggleButton is clicked */
  onChange: PropTypes.func.isRequired,
  /** Label of the input  */
  label: PropTypes.string,
  /** Sets component id */
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Class name */
  className: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets the font weight */
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Sets the font size */
  fontSize: PropTypes.string,
};

ToggleIcon.propTypes = {
  isChecked: PropTypes.bool,
};

export default ToggleButton;
