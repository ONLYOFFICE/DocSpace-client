import React from "react";
import PropTypes from "prop-types";

import Text from "../text";
import {
  EmptyContentBody,
  EmptyContentImage,
} from "./styled-empty-screen-container";

import { isTablet } from "../utils/device";

const EmptyScreenContainer = (props: any) => {
  const {
    imageSrc,
    imageAlt,
    headerText,
    subheadingText,
    descriptionText,
    buttons,
    imageStyle,
    buttonStyle,
  } = props;
  return (
    <EmptyContentBody {...props}>
      <EmptyContentImage
        // @ts-expect-error TS(2769): No overload matches this call.
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        style={!isTablet() ? imageStyle : {}}
        className="ec-image"
      />

      {headerText && (
        // @ts-expect-error TS(2322): Type '{ children: any; as: string; fontSize: strin... Remove this comment to see the full error message
        <Text
          as="span"
          fontSize="19px"
          fontWeight="700"
          className="ec-header"
          noSelect
        >
          {headerText}
        </Text>
      )}

      {subheadingText && (
        // @ts-expect-error TS(2322): Type '{ children: any; as: string; fontWeight: str... Remove this comment to see the full error message
        <Text as="span" fontWeight="600" className="ec-subheading" noSelect>
          {subheadingText}
        </Text>
      )}

      {descriptionText && (
        // @ts-expect-error TS(2322): Type '{ children: any; as: string; fontSize: strin... Remove this comment to see the full error message
        <Text as="span" fontSize="12px" className="ec-desc" noSelect>
          {descriptionText}
        </Text>
      )}

      {buttons && (
        <div className="ec-buttons" style={buttonStyle}>
          {buttons}
        </div>
      )}
    </EmptyContentBody>
  );
};

EmptyScreenContainer.propTypes = {
  /** Image url source */
  imageSrc: PropTypes.string,
  /** Alternative image text */
  imageAlt: PropTypes.string,
  /** Header text */
  headerText: PropTypes.string,
  /** Subheading text */
  subheadingText: PropTypes.string,
  /** Description text */
  descriptionText: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  /** Content of EmptyContentButtonsContainer */
  buttons: PropTypes.any,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default EmptyScreenContainer;
