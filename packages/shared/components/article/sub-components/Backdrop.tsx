import React from "react";
import PropTypes from "prop-types";

import { Backdrop } from "@docspace/shared/components/backdrop";

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

ArticleBackdrop.propTypes = {
  showText: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(ArticleBackdrop);
