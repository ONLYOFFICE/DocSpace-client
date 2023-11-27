import React from "react";
import PropTypes from "prop-types";
import RadioButton from "../radio-button";
import StyledDiv from "./styled-radio-button-group";
import Text from "../text";

class RadioButtonGroup extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      // @ts-expect-error TS(2339): Property 'selected' does not exist on type 'Readon... Remove this comment to see the full error message
      selectedOption: this.props.selected,
    };
  }

  handleOptionChange = (changeEvent: any) => {
    this.setState({
      selectedOption: changeEvent.target.value,
    });
  };

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'selected' does not exist on type 'Readon... Remove this comment to see the full error message
    if (this.props.selected !== prevProps.selected) {
      // @ts-expect-error TS(2339): Property 'selected' does not exist on type 'Readon... Remove this comment to see the full error message
      this.setState({ selectedOption: this.props.selected });
    }
  }

  render() {
    // @ts-expect-error TS(2339): Property 'options' does not exist on type 'Readonl... Remove this comment to see the full error message
    const options = this.props.options;
    // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const theme = this.props.theme;
    return (
      <StyledDiv
        // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
        id={this.props.id}
        // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
        className={this.props.className}
        // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
        style={this.props.style}
        // @ts-expect-error TS(2339): Property 'orientation' does not exist on type 'Rea... Remove this comment to see the full error message
        orientation={this.props.orientation}
        // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
        width={this.props.width}
      >
        {options.map((option: any) => {
          if (option.type === "text")
            return (
              // @ts-expect-error TS(2322): Type '{ children: any; key: string; className: str... Remove this comment to see the full error message
              <Text key="radio-text" className="subtext">
                {option.label}
              </Text>
            );
          return (
            <RadioButton
              // @ts-expect-error TS(2322): Type '{ id: any; key: any; name: any; value: any; ... Remove this comment to see the full error message
              id={option.id}
              key={option.value}
              // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
              name={this.props.name}
              value={option.value}
              // @ts-expect-error TS(2339): Property 'selectedOption' does not exist on type '... Remove this comment to see the full error message
              isChecked={this.state.selectedOption === option.value}
              onChange={(e: any) => {
                this.handleOptionChange(e);
                // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
                this.props.onClick && this.props.onClick(e);
              }}
              // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
              isDisabled={this.props.isDisabled || option.disabled}
              label={option.label}
              // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
              fontSize={this.props.fontSize}
              // @ts-expect-error TS(2339): Property 'fontWeight' does not exist on type 'Read... Remove this comment to see the full error message
              fontWeight={this.props.fontWeight}
              // @ts-expect-error TS(2339): Property 'spacing' does not exist on type 'Readonl... Remove this comment to see the full error message
              spacing={this.props.spacing}
              // @ts-expect-error TS(2339): Property 'orientation' does not exist on type 'Rea... Remove this comment to see the full error message
              orientation={this.props.orientation}
            />
          );
        })}
      </StyledDiv>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RadioButtonGroup.propTypes = {
  /** Disables all radiobuttons in the group */
  isDisabled: PropTypes.bool,
  /** Used as HTML `value` property for `<input>` tag. Facilitates identification of each RadioButtonGroup */
  name: PropTypes.string.isRequired,
  /** Allows handling clicking events on `<RadioButton />` component */
  onClick: PropTypes.func,
  /** Array of objects, contains props for each `<RadioButton />` component */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
      disabled: PropTypes.bool,
    })
  ).isRequired,
  /** Value of the selected radiobutton */
  selected: PropTypes.string.isRequired,
  /** Sets margin between radiobuttons. In case the orientation is `horizontal`, `margin-left` is applied for all radiobuttons,
   * except the first one. If the orientation is `vertical`, `margin-bottom` is applied for all radiobuttons, except the last one */
  spacing: PropTypes.string,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Position of radiobuttons  */
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  /** Width of RadioButtonGroup container */
  width: PropTypes.string,
  /** Link font size */
  fontSize: PropTypes.string,
  /** Link font weight  */
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
RadioButtonGroup.defaultProps = {
  isDisabled: false,
  selected: undefined,
  spacing: "15px",
  orientation: "horizontal",
};

export default RadioButtonGroup;
