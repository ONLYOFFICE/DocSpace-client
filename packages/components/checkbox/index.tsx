import React from "react";
import PropTypes from "prop-types";

import Text from "../text";
import { StyledLabel, HiddenInput } from "./styled-checkbox";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/checkbox.ind... Remove this comment to see the full error message
import CheckboxIndeterminateIcon from "PUBLIC_DIR/images/checkbox.indeterminate.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/checkbox.che... Remove this comment to see the full error message
import CheckboxCheckedIcon from "PUBLIC_DIR/images/checkbox.checked.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/checkbox.rea... Remove this comment to see the full error message
import CheckboxIcon from "PUBLIC_DIR/images/checkbox.react.svg";

// eslint-disable-next-line react/prop-types
const RenderCheckboxIcon = ({
  isChecked,
  isIndeterminate,
  tabIndex
}: any) => {
  // let newProps = {
  //   size: "medium",
  //   className: "checkbox",
  // };

  // return <>{React.createElement(Icons[iconName], { ...newProps })}</>;

  return (
    <>
      {isIndeterminate ? (
        <CheckboxIndeterminateIcon
          tabIndex={tabIndex}
          className="checkbox not-selectable"
        />
      ) : isChecked ? (
        <CheckboxCheckedIcon
          tabIndex={tabIndex}
          className="checkbox not-selectable"
        />
      ) : (
        <CheckboxIcon tabIndex={tabIndex} className="checkbox not-selectable" />
      )}
    </>
  );
};

class Checkbox extends React.Component {
  ref: any;
  constructor(props: any) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      checked: props.isChecked,
    };

    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
    this.ref.current.indeterminate = this.props.isIndeterminate;
  }

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
    if (this.props.isIndeterminate !== prevProps.isIndeterminate) {
      // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
      this.ref.current.indeterminate = this.props.isIndeterminate;
    }

    // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isChecked !== prevProps.isChecked) {
      // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
      this.setState({ checked: this.props.isChecked });
    }
  }

  onInputChange(e: any) {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.isDisabled) return e.preventDefault();
    e.stopPropagation();
    this.setState({ checked: e.target.checked });
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onChange && this.props.onChange(e);
  }

  onClick(e: any) {
    return e.preventDefault();
  }

  render() {
    //console.log("Checkbox render");
    const {
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
      isIndeterminate,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
      label,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
      value,
      // @ts-expect-error TS(2339): Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
      title,
      // @ts-expect-error TS(2339): Property 'truncate' does not exist on type 'Readon... Remove this comment to see the full error message
      truncate,
      // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      name,
      // @ts-expect-error TS(2339): Property 'helpButton' does not exist on type 'Read... Remove this comment to see the full error message
      helpButton,
      // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
      onChange,
      // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
      isChecked,
      // @ts-expect-error TS(2339): Property 'tabIndex' does not exist on type 'Readon... Remove this comment to see the full error message
      tabIndex,
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
      hasError,
      ...rest
    } = this.props;

    return (
      <>
        <StyledLabel
          id={id}
          style={style}
          // @ts-expect-error TS(2769): No overload matches this call.
          isDisabled={isDisabled}
          isIndeterminate={isIndeterminate}
          className={className}
          title={title}
          hasError={hasError}
        >
          <HiddenInput
            name={name}
            type="checkbox"
            // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
            checked={this.state.checked}
            // @ts-expect-error TS(2769): No overload matches this call.
            isDisabled={isDisabled}
            ref={this.ref}
            value={value}
            onChange={this.onInputChange}
            tabIndex={-1}
            {...rest}
          />
          <RenderCheckboxIcon tabIndex={tabIndex} {...this.props} />
          <div className="wrapper">
            // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
            {this.props.label && (
              // @ts-expect-error TS(2322): Type '{ children: any; as: string; title: any; isD... Remove this comment to see the full error message
              <Text
                as="span"
                title={title}
                isDisabled={isDisabled}
                truncate={truncate}
                className="checkbox-text"
              >
                {label}
              </Text>
            )}
            {helpButton && (
              <span className="help-button" onClick={this.onClick}>
                {helpButton}
              </span>
            )}
          </div>
        </StyledLabel>
      </>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Checkbox.propTypes = {
  /** Used as HTML id property */
  id: PropTypes.string,
  /** Used as HTML `name` property */
  name: PropTypes.string,
  /** Value of the input */
  value: PropTypes.string,
  /** Label of the input */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Sets the checked state of the checkbox */
  isChecked: PropTypes.bool,
  /** The state is displayed as a rectangle in the checkbox when set to true */
  isIndeterminate: PropTypes.bool,
  /** Disables the Checkbox input */
  isDisabled: PropTypes.bool,
  /** Is triggered whenever the CheckboxInput is clicked */
  onChange: PropTypes.func,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Title */
  title: PropTypes.string,
  /** Disables word wrapping */
  truncate: PropTypes.bool,
  /** Renders the help button */
  helpButton: PropTypes.any,
  /** Checkbox tab index */
  tabIndex: PropTypes.number,
  /** Notifies if the error occurs */
  hasError: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
Checkbox.defaultProps = {
  isChecked: false,
  truncate: false,
  tabIndex: -1,
  hasError: false,
};

export default React.memo(Checkbox);
