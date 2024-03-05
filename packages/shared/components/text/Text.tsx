import React from "react";

import StyledText, { StyledAutoDirSpan } from "./Text.styled";
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
  dir,
  children,
  ...rest
}: TextProps) => {
  const isAutoDir = dir === "auto";
  const dirProp = isAutoDir ? {} : { dir };

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
      {...dirProp}
      {...rest}
    >
      {isAutoDir ? (
        <StyledAutoDirSpan dir="auto">{children}</StyledAutoDirSpan>
      ) : (
        children
      )}
    </StyledText>
  );
};

const Text = React.memo<TextProps>(TextPure);

Text.displayName = "Text";

export { Text, TextPure };
