import React from "react";
import PropTypes from "prop-types";
import IconButton from "../icon-button";
import Tooltip from "../tooltip";
import uniqueId from "lodash/uniqueId";
import { classNames } from "../utils/classNames";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/info.react.s... Remove this comment to see the full error message
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

class HelpButton extends React.Component {
  id: any;
  ref: any;
  constructor(props: any) {
    super(props);

    // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
    this.id = this.props.id || uniqueId();
  }

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'tooltipContent' does not exist on type '... Remove this comment to see the full error message
      tooltipContent,
      // @ts-expect-error TS(2339): Property 'place' does not exist on type 'Readonly<... Remove this comment to see the full error message
      place,
      // @ts-expect-error TS(2339): Property 'offset' does not exist on type 'Readonly... Remove this comment to see the full error message
      offset,
      // @ts-expect-error TS(2339): Property 'iconName' does not exist on type 'Readon... Remove this comment to see the full error message
      iconName,
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
      color,
      // @ts-expect-error TS(2339): Property 'getContent' does not exist on type 'Read... Remove this comment to see the full error message
      getContent,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'dataTip' does not exist on type 'Readonl... Remove this comment to see the full error message
      dataTip,
      // @ts-expect-error TS(2339): Property 'tooltipMaxWidth' does not exist on type ... Remove this comment to see the full error message
      tooltipMaxWidth,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'afterShow' does not exist on type 'Reado... Remove this comment to see the full error message
      afterShow,
      // @ts-expect-error TS(2339): Property 'afterHide' does not exist on type 'Reado... Remove this comment to see the full error message
      afterHide,
    } = this.props;

    const anchorSelect = `div[id='${this.id}'] svg`;

    return (
      <div ref={this.ref} style={style}>
        <IconButton
          // @ts-expect-error TS(2322): Type '{ id: any; theme: any; className: any; isCli... Remove this comment to see the full error message
          id={this.id}
          // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
          theme={this.props.theme}
          className={classNames(className, "help-icon")}
          isClickable={true}
          iconName={iconName}
          size={size}
          color={color}
          data-for={this.id}
          dataTip={dataTip}
        />

        {getContent ? (
          <Tooltip
            clickable
            openOnClick
            place={place}
            offset={offset}
            afterShow={afterShow}
            afterHide={afterHide}
            maxWidth={tooltipMaxWidth}
            getContent={getContent}
            anchorSelect={anchorSelect}
          />
        ) : (
          <Tooltip
            clickable
            openOnClick
            place={place}
            offset={offset}
            afterShow={afterShow}
            afterHide={afterHide}
            maxWidth={tooltipMaxWidth}
            anchorSelect={anchorSelect}
          >
            {tooltipContent}
          </Tooltip>
        )}
      </div>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
HelpButton.propTypes = {
  /** Displays the child elements  */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /** Sets the tooltip content  */
  tooltipContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Required to set additional properties of the tooltip */
  tooltipProps: PropTypes.object,
  /** Sets the maximum width of the tooltip  */
  tooltipMaxWidth: PropTypes.string,
  /** Sets the tooltip id */
  tooltipId: PropTypes.string,
  /** Global tooltip placement */
  place: PropTypes.string,
  /** Specifies the icon name */
  iconName: PropTypes.string,
  /** Icon color */
  color: PropTypes.string,
  /** The data-* attribute is used to store custom data private to the page or application. Required to display a tip over the hovered element */
  dataTip: PropTypes.string,
  /** Sets a callback function that generates the tip content dynamically */
  getContent: PropTypes.func,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style  */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Button height and width value */
  size: PropTypes.number,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
HelpButton.defaultProps = {
  iconName: InfoReactSvgUrl,
  place: "top",
  className: "icon-button",
  size: 12,
};

export default HelpButton;
