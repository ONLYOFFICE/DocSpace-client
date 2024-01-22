import React from "react";

import { Backdrop } from "../../backdrop";

import { StyledControlContainer, StyledCrossIcon } from "../Article.styled";
import { ArticleBackdropProps } from "../Article.types";

const ArticleBackdrop = ({ onClick, ...rest }: ArticleBackdropProps) => {
  return (
    <>
      <StyledControlContainer onClick={onClick} {...rest}>
        <StyledCrossIcon />
      </StyledControlContainer>
      <Backdrop onClick={onClick} visible zIndex={210} withBackground />
    </>
  );
};

export default React.memo(ArticleBackdrop);
