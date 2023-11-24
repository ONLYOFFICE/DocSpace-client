import React from "react";
import PropTypes from "prop-types";
import StyledText from "./styled-text";

import { TextProps } from "./Text.types";

const Text = ({
  title,
  tag,
  as,
  fontSize,
  fontWeight,
  color,
  textAlign,
  ...rest
}: TextProps) => {
  return (
    <StyledText
      fontSizeProp={fontSize}
      fontWeightProp={fontWeight}
      colorProp={color}
      textAlign={textAlign}
      as={!as && tag ? tag : as}
      title={title}
      {...rest}
    />
  );
};

Text.propTypes = {};

Text.defaultProps = {
  title: null,
  textAlign: "left",
  fontSize: "13px",
  truncate: false,
  isBold: false,
  isInline: false,
  isItalic: false,
  noSelect: false,
};

export default React.memo(Text);
