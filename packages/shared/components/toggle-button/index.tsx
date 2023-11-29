import PropTypes from "prop-types";
import { motion } from "framer-motion";
import React, { Component } from "react";

import Text from "../text";

import ToggleButtonTheme from "./ToggleButton.theme";
import { ToggleButtonContainer, HiddenInput } from "./styled-toggle-button";

const ToggleIcon = ({
  isChecked,
  isLoading,
  noAnimation = false
}: any) => {
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
  constructor(props: any) {
    super(props);
    this.state = {
      checked: props.isChecked,
    };
  }

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isChecked !== prevProps.isChecked) {
      // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
      this.setState({ checked: this.props.isChecked });
    }
  }

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
      label,
      // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
      onChange,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
      isLoading,
      // @ts-expect-error TS(2339): Property 'noAnimation' does not exist on type 'Rea... Remove this comment to see the full error message
      noAnimation,
    } = this.props;

    //console.log("ToggleButton render");

    return (
      <ToggleButtonTheme
        id={id}
        className={className}
        style={style}
        // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
        isChecked={this.state.checked}
        isDisabled={isDisabled}
      >
        <ToggleButtonContainer
          id={id}
          className={className}
          style={style}
          // @ts-expect-error TS(2769): No overload matches this call.
          isDisabled={isDisabled}
          // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
          isChecked={this.state.checked}
        >
          <HiddenInput
            type="checkbox"
            // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
            checked={this.state.checked}
            disabled={isDisabled}
            onChange={onChange}
          />
          <ToggleIcon
            // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
            isChecked={this.state.checked}
            // @ts-expect-error TS(2322): Type '{ isChecked: any; isLoading: any; noAnimatio... Remove this comment to see the full error message
            isLoading={isLoading}
            noAnimation={noAnimation}
          />
          {label && (
            // @ts-expect-error TS(2322): Type '{ children: any; className: string; as: stri... Remove this comment to see the full error message
            <Text className="toggle-button-text" as="span">
              {label}
            </Text>
          )}
        </ToggleButtonContainer>
      </ToggleButtonTheme>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
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
};

ToggleIcon.propTypes = {
  isChecked: PropTypes.bool,
};

export default ToggleButton;
