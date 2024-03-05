import React from "react";

import { RectangleSkeleton } from "../../rectangle";

import { StyledContainer, StyledBlock } from "./ProfileLoader.styled";
import { ProfileLoaderProps } from "./ProfileLoader.types";

const ArticleProfileLoader = ({
  id,
  className,
  style,
  showText,
}: ProfileLoaderProps) => {
  return (
    <StyledContainer
      id={id}
      className={className}
      style={style}
      showText={showText}
    >
      <StyledBlock>
        {showText ? (
          <>
            <RectangleSkeleton width="40px" height="40px" borderRadius="50%" />
            <RectangleSkeleton width="131px" height="18px" className="title" />
            <RectangleSkeleton
              width="16px"
              height="16px"
              className="option-button"
            />
          </>
        ) : (
          <RectangleSkeleton width="32px" height="32px" borderRadius="50%" />
        )}
      </StyledBlock>
    </StyledContainer>
  );
};

export default ArticleProfileLoader;
