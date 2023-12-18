import React from "react";

import { isTablet } from "../../utils";
import { Text } from "../text";

import {
  EmptyContentBody,
  EmptyContentImage,
} from "./EmptyScreenContainer.styled";

import { EmptyScreenContainerProps } from "./EmptyScreenContainer.types";

const EmptyScreenContainer = (props: EmptyScreenContainerProps) => {
  const {
    imageSrc,
    imageAlt,
    headerText,
    subheadingText,
    descriptionText,
    buttons,
    imageStyle,
    buttonStyle,
    withoutFilter,
  } = props;
  return (
    <EmptyContentBody
      withoutFilter={withoutFilter}
      subheadingText={!!subheadingText}
      descriptionText={!!descriptionText}
      data-testid="empty-screen-container"
    >
      <EmptyContentImage
        src={imageSrc}
        alt={imageAlt}
        style={!isTablet() ? imageStyle : {}}
        className="ec-image"
      />

      {headerText && (
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
        <Text as="span" fontWeight="600" className="ec-subheading" noSelect>
          {subheadingText}
        </Text>
      )}

      {descriptionText && (
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

export { EmptyScreenContainer };
