import React from "react";
import PropTypes from "prop-types";

import Label from "../label";
import HelpButton from "../help-button";
import Text from "../text";
import Container from "./styled-field-container";

const displayInlineBlock = { display: "inline-block" };

class FieldContainer extends React.Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'isVertical' does not exist on type 'Read... Remove this comment to see the full error message
      isVertical,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'isRequired' does not exist on type 'Read... Remove this comment to see the full error message
      isRequired,
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
      hasError,
      // @ts-expect-error TS(2339): Property 'labelVisible' does not exist on type 'Re... Remove this comment to see the full error message
      labelVisible,
      // @ts-expect-error TS(2339): Property 'labelText' does not exist on type 'Reado... Remove this comment to see the full error message
      labelText,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'tooltipContent' does not exist on type '... Remove this comment to see the full error message
      tooltipContent,
      // @ts-expect-error TS(2339): Property 'place' does not exist on type 'Readonly<... Remove this comment to see the full error message
      place,
      // @ts-expect-error TS(2339): Property 'helpButtonHeaderContent' does not exist ... Remove this comment to see the full error message
      helpButtonHeaderContent,
      // @ts-expect-error TS(2339): Property 'maxLabelWidth' does not exist on type 'R... Remove this comment to see the full error message
      maxLabelWidth,
      // @ts-expect-error TS(2339): Property 'errorMessage' does not exist on type 'Re... Remove this comment to see the full error message
      errorMessage,
      // @ts-expect-error TS(2339): Property 'errorColor' does not exist on type 'Read... Remove this comment to see the full error message
      errorColor,
      // @ts-expect-error TS(2339): Property 'errorMessageWidth' does not exist on typ... Remove this comment to see the full error message
      errorMessageWidth,
      // @ts-expect-error TS(2339): Property 'inlineHelpButton' does not exist on type... Remove this comment to see the full error message
      inlineHelpButton,
      // @ts-expect-error TS(2339): Property 'offsetRight' does not exist on type 'Rea... Remove this comment to see the full error message
      offsetRight,
      // @ts-expect-error TS(2339): Property 'tooltipMaxWidth' does not exist on type ... Remove this comment to see the full error message
      tooltipMaxWidth,
      // @ts-expect-error TS(2339): Property 'tooltipClass' does not exist on type 'Re... Remove this comment to see the full error message
      tooltipClass,
      // @ts-expect-error TS(2339): Property 'removeMargin' does not exist on type 'Re... Remove this comment to see the full error message
      removeMargin,
    } = this.props;

    return (
      <Container
        // @ts-expect-error TS(2769): No overload matches this call.
        vertical={isVertical}
        maxLabelWidth={maxLabelWidth}
        className={className}
        id={id}
        style={style}
        maxwidth={errorMessageWidth}
        removeMargin={removeMargin}
      >
        {labelVisible &&
          (!inlineHelpButton ? (
            <div className="field-label-icon">
              <Label
                isRequired={isRequired}
                //error={hasError}
                text={labelText}
                truncate={true}
                className="field-label"
                // @ts-expect-error TS(2322): Type '{ isRequired: any; text: any; truncate: true... Remove this comment to see the full error message
                tooltipMaxWidth={tooltipMaxWidth}
              />
              {tooltipContent && (
                <HelpButton
                  // @ts-expect-error TS(2322): Type '{ className: any; tooltipContent: any; place... Remove this comment to see the full error message
                  className={tooltipClass}
                  tooltipContent={tooltipContent}
                  place={place}
                  helpButtonHeaderContent={helpButtonHeaderContent}
                />
              )}
            </div>
          ) : (
            <div className="field-label-icon">
              <Label
                isRequired={isRequired}
                //error={hasError}
                text={labelText}
                truncate={true}
                className="field-label"
              >
                {tooltipContent && (
                  <HelpButton
                    // @ts-expect-error TS(2322): Type '{ className: any; tooltipContent: any; place... Remove this comment to see the full error message
                    className={tooltipClass}
                    tooltipContent={tooltipContent}
                    place={place}
                    helpButtonHeaderContent={helpButtonHeaderContent}
                    style={displayInlineBlock}
                    offsetRight={0}
                  />
                )}
              </Label>
            </div>
          ))}

        <div className="field-body">
          {children}
          {hasError ? (
            // @ts-expect-error TS(2322): Type '{ children: any; className: string; fontSize... Remove this comment to see the full error message
            <Text className="error-label" fontSize="12px" color={errorColor}>
              {errorMessage}
            </Text>
          ) : null}
        </div>
      </Container>
    );
  }
}

// @ts-expect-error TS(2339): Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
FieldContainer.displayName = "FieldContainer";

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
FieldContainer.propTypes = {
  /** Vertical or horizontal alignment */
  isVertical: PropTypes.bool,
  /** Remove default margin property */
  removeMargin: PropTypes.bool,
  /** Accepts class */
  className: PropTypes.string,
  /** Indicates that the field is required to fill */
  isRequired: PropTypes.bool,
  /** Indicates that the field is incorrect */
  hasError: PropTypes.bool,
  /** Sets visibility of the field label section */
  labelVisible: PropTypes.bool,
  /** Field label text or element */
  labelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  /** Icon source */
  icon: PropTypes.string,
  /** Renders the help button inline instead of the separate div*/
  inlineHelpButton: PropTypes.bool,
  /** Children elements */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /** Tooltip content */
  tooltipContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Sets the global position of the tooltip */
  place: PropTypes.string,
  /** Tooltip header content (tooltip opened in aside) */
  helpButtonHeaderContent: PropTypes.string,
  /** Max label width in horizontal alignment */
  maxLabelWidth: PropTypes.string,
  /** Error message text */
  errorMessage: PropTypes.string,
  /** Error text color */
  errorColor: PropTypes.string,
  /** Error text width */
  errorMessageWidth: PropTypes.string,
  /** Accepts id  */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Specifies the offset */
  offsetRight: PropTypes.number,
  /** Sets the maximum width of the tooltip  */
  tooltipMaxWidth: PropTypes.string,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
FieldContainer.defaultProps = {
  place: "bottom",
  labelVisible: true,
  maxLabelWidth: "110px",
  errorMessageWidth: "293px",
  offsetRight: 0,
  removeMargin: false,
};

export default FieldContainer;
