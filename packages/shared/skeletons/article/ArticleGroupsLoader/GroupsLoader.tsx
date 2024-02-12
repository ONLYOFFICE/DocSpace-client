import React from "react";

import { StyledContainer, StyledRectangleLoader } from "./GroupsLoader.styled";
import { GroupsLoaderProps } from "./GroupsLoader.types";

const ArticleGroupsLoader = ({
  id,
  className,
  style,
  showText,
  ...rest
}: GroupsLoaderProps) => {
  return (
    <StyledContainer
      id={id}
      className={className}
      style={style}
      showText={showText}
    >
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
      <StyledRectangleLoader {...rest} />
    </StyledContainer>
  );
};

export default ArticleGroupsLoader;
