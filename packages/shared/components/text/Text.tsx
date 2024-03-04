import React from "react";

import StyledText from "./Text.styled";
import { TextProps } from "./Text.types";

const TextPure = ({
  title,
  tag,
  as,
  fontSize = "13px",
  fontWeight,
  color,
  textAlign = "left",
  onClick,
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
      onClick={onClick}
      {...rest}
    />
  );
};

const Text = React.memo<TextProps>(TextPure);

Text.displayName = "Text";

export { Text, TextPure };
