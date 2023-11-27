import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { ArrowContentReactSvg } from "./svg";
import Heading from "../heading";
import { StyledContent, StyledContainer } from "./styled-toggle-content";
import commonIconsStyles from "../utils/common-icons-style";

const StyledArrowContentIcon = styled(ArrowContentReactSvg)`
  ${commonIconsStyles}
`;
// eslint-disable-next-line react/prop-types, no-unused-vars
class ToggleContent extends React.Component {
  constructor(props: any) {
    super(props);

    const { isOpen } = props;

    this.state = {
      isOpen,
    };
  }

  toggleContent = () => {
    // @ts-expect-error TS(2339): Property 'enableToggle' does not exist on type 'Re... Remove this comment to see the full error message
    if (!this.props.enableToggle) return;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setState({ isOpen: !this.state.isOpen });
  };

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { isOpen } = this.props;
    if (isOpen !== prevProps.isOpen) {
      this.setState({ isOpen });
    }
  }

  render() {
    // console.log("ToggleContent render");

    // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
    const { children, className, id, label, style, enableToggle } = this.props;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { isOpen } = this.state;

    return (
      <StyledContainer
        className={className}
        // @ts-expect-error TS(2769): No overload matches this call.
        isOpen={isOpen}
        id={id}
        style={style}
        enableToggle={enableToggle}
      >
        <div className="toggle-container">
          <span className="span-toggle-content" onClick={this.toggleContent}>
            <StyledArrowContentIcon
              className="arrow-toggle-content"
              size="medium"
            />
            // @ts-expect-error TS(2322): Type '{ children: any; className: string; level: n... Remove this comment to see the full error message
            <Heading
              className="heading-toggle-content"
              level={2}
              size="small"
              isInline={true}
            >
              {label}
            </Heading>
          </span>
        </div>
        // @ts-expect-error TS(2769): No overload matches this call.
        <StyledContent isOpen={isOpen}>{children}</StyledContent>
      </StyledContainer>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ToggleContent.propTypes = {
  /** Displays the child elements */
  children: PropTypes.any,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id  */
  id: PropTypes.string,
  /** Displays the component's state */
  isOpen: PropTypes.bool,
  /** Sets the header label */
  label: PropTypes.string.isRequired,
  /** The change event is triggered when the element's value is modified */
  onChange: PropTypes.func,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Enables/disables toggle */
  enableToggle: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ToggleContent.defaultProps = {
  isOpen: false,
  enableToggle: true,
  label: "",
};

export default ToggleContent;
