import React from "react";
import PropTypes from "prop-types";

import { RadioButtonReactSvg, RadioButtonCheckedReactSvg } from "./svg";
import Text from "../text";
import { Label, Input } from "./styled-radio-button";

// eslint-disable-next-line react/prop-types
const RadiobuttonIcon = ({
  isChecked,
  theme
}: any) => {
  let newProps = {
    size: "medium",
    className: "radio-button",
    theme: theme,
  };

  return (
    <>
      {isChecked ? (
        <RadioButtonCheckedReactSvg {...newProps} />
      ) : (
        <RadioButtonReactSvg {...newProps} />
      )}
    </>
  );
};

class RadioButton extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
      isChecked: this.props.isChecked,
    };
  }

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isChecked !== prevProps.isChecked) {
      // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
      this.setState({ isChecked: this.props.isChecked });
    }
  }

  render() {
    // @ts-expect-error TS(2339): Property 'classNameInput' does not exist on type '... Remove this comment to see the full error message
    const setClassNameInput = this.props.classNameInput
      ? {
          // @ts-expect-error TS(2339): Property 'classNameInput' does not exist on type '... Remove this comment to see the full error message
          className: this.props.classNameInput,
        }
      : {};

    return (
      <Label
        // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
        theme={this.props.theme}
        // @ts-expect-error TS(2339): Property 'orientation' does not exist on type 'Rea... Remove this comment to see the full error message
        orientation={this.props.orientation}
        // @ts-expect-error TS(2339): Property 'spacing' does not exist on type 'Readonl... Remove this comment to see the full error message
        spacing={this.props.spacing}
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
        isDisabled={this.props.isDisabled}
        // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
        id={this.props.id}
        // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
        className={this.props.className}
        // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
        style={this.props.style}
      >
        <Input
          // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
          theme={this.props.theme}
          type="radio"
          // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
          name={this.props.name}
          // @ts-expect-error TS(2339): Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
          value={this.props.value}
          // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
          checked={this.props.isChecked}
          onChange={
            // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.onChange
              // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
              ? this.props.onChange
              : (e) => {
                  this.setState({ isChecked: true });
                  // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
                  this.props.onClick && this.props.onClick(e);
                }
          }
          // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
          disabled={this.props.isDisabled}
          {...setClassNameInput}
        />
        <RadiobuttonIcon {...this.props} />
        // @ts-expect-error TS(2322): Type '{ children: any; theme: any; as: string; cla... Remove this comment to see the full error message
        <Text
          // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
          theme={this.props.theme}
          as="span"
          className="radio-button_text"
          // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
          fontSize={this.props.fontSize}
          // @ts-expect-error TS(2339): Property 'fontWeight' does not exist on type 'Read... Remove this comment to see the full error message
          fontWeight={this.props.fontWeight}
        >
          // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
          {this.props.label || this.props.value}
        </Text>
      </Label>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RadioButton.propTypes = {
  /** Used as HTML `checked` property for each `<input>` tag */
  isChecked: PropTypes.bool,
  /** Used as HTML `disabled` property for each `<input>` tag */
  isDisabled: PropTypes.bool,
  /** Radiobutton name. In case the name is not stated, `value` is used */
  label: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
  /** Link font size */
  fontSize: PropTypes.string,
  /** Link font weight */
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Used as HTML `name` property for `<input>` tag. */
  name: PropTypes.string.isRequired,
  /** Allows handling the changing events of the component  */
  onChange: PropTypes.func,
  /** Allows handling component clicking events */
  onClick: PropTypes.func,
  /** Used as HTML `value` property for `<input>` tag. Facilitates identification of each radiobutton  */
  value: PropTypes.string.isRequired,
  /** Sets margin between radiobuttons. In case the orientation is `horizontal`,
   * `margin-left` is applied for all radiobuttons, except the first one.
   * In case the orientation is `vertical`, `margin-bottom` is applied for all radiobuttons, except the last one */
  spacing: PropTypes.string,
  /** Accepts class  */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style  */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Position of radiobuttons */
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
RadioButton.defaultProps = {
  isChecked: false,
  isDisabled: false,
  label: "",
};

export default RadioButton;
