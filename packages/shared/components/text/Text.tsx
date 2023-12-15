import React from "react";

import StyledText from "./Text.styled";
import { TextProps } from "./Text.types";

const TextPure = ({
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
      data-testid="text"
      {...rest}
    />
  );
};

TextPure.defaultProps = {
  textAlign: "left",
  fontSize: "13px",
  truncate: false,
  isBold: false,
  isInline: false,
  isItalic: false,
  noSelect: false,
};

const Text = React.memo<TextProps>(TextPure);

Text.displayName = "Text";

export { Text, TextPure };
