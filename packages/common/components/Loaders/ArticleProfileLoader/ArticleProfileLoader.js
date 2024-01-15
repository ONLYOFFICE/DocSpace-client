import React from "react";
import PropTypes from "prop-types";
import { StyledContainer, StyledBlock } from "./StyledArticleProfileLoader";
import { inject, observer } from "mobx-react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

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
            <RectangleSkeleton
              width={"40px"}
              height={"40px"}
              borderRadius={"50%"}
            />
            <RectangleSkeleton
              width={"131px"}
              height={"18px"}
              className={"title"}
            />
            <RectangleSkeleton
              width={"16px"}
              height={"16px"}
              className={"option-button"}
            />
          </>
        ) : (
          <RectangleSkeleton
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
