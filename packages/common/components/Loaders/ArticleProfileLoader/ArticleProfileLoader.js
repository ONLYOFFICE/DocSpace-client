import React from "react";
import PropTypes from "prop-types";
import {
  StyledContainer,
  StyledBlock,
  StyledRectangleLoader,
} from "./StyledArticleProfileLoader";
import { inject, observer } from "mobx-react";
import RectangleLoader from "../RectangleLoader/RectangleLoader";

const ArticleProfileLoader = ({
  id,
  className,
  style,
  showText,
  isVisitor,
  ...rest
}) => {
  return (
    <StyledContainer
      id={id}
      className={className}
      style={style}
      showText={showText}
    >
      <StyledBlock showText={showText}>
        {showText ? (
          <>
            <RectangleLoader
              width={"40px"}
              height={"40px"}
              borderRadius={"50%"}
            />
            <RectangleLoader
              width={"131px"}
              height={"18px"}
              className={"title"}
            />
            <RectangleLoader
              width={"16px"}
              height={"16px"}
              className={"option-button"}
            />
          </>
        ) : (
          <RectangleLoader
            width={"32px"}
            height={"32px"}
            borderRadius={"50%"}
          />
        )}
      </StyledBlock>
    </StyledContainer>
  );
};

ArticleProfileLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  showText: PropTypes.bool,
};

ArticleProfileLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default inject(({ auth }) => {
  return {
    showText: auth.settingsStore.showText,
    isVisitor: auth.userStore.user.isVisitor,
  };
})(observer(ArticleProfileLoader));
