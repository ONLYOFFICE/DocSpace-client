import React from "react";
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { ReactSVG } from "react-svg";
import { desktop, mobile, tablet } from "@docspace/shared/utils";

import { useTranslation } from "react-i18next";
import Base from "@docspace/shared/themes/base";
import ArticleHideMenuReactSvgUrl from "PUBLIC_DIR/images/article-hide-menu.react.svg?url";
import ArticleShowMenuReactSvgUrl from "PUBLIC_DIR/images/article-show-menu.react.svg?url";

const StyledHideArticleMenuButton = styled.div`
  display: flex;
  align-items: center;
  position: ${(props) => (props.isVirtualKeyboardOpen ? "absolute" : "fixed")};
  height: 44px;
  z-index: 209;
  bottom: ${(props) => (props.hideProfileBlock ? "16px" : "89px")};

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  min-width: ${({ showText }) => (showText ? "243px" : "60px")};
  max-width: ${({ showText }) => (showText ? "243px" : "60px")};

  @media ${desktop} {
    display: none;
  }

  @media ${mobile} {
    display: none;
  }

  .article-hide-menu-container {
    align-items: center;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 16px;
          `
        : css`
            margin-left: 16px;
          `}
    .article-hide-menu-text {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
      color: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
    }

    @media ${tablet} {
      display: ${({ showText }) => (showText ? "flex" : "none")};
    }
  }

  .article-show-menu-container {
    justify-content: center;
    width: 100%;

    @media ${tablet} {
      display: ${({ showText }) => (showText ? "none" : "flex")};
    }
  }

  .article-hide-menu-icon_svg,
  .article-show-menu-icon_svg {
    height: 20px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform: scaleX(-1);
      `}
  }

  .article-hide-menu-icon_svg {
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform: scaleX(-1);
      `}
    svg {
      path {
        fill: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
      }
    }
  }

  .article-show-menu-icon_svg {
    svg {
      path {
        fill: ${(props) => props.theme.article.catalogShowText};
      }
    }
  }
`;

StyledHideArticleMenuButton.defaultProps = { theme: Base };

const HideArticleMenuButton = ({
  showText,
  toggleShowText,
  currentColorScheme,
  isVirtualKeyboardOpen,
  hideProfileBlock,
}) => {
  const { t } = useTranslation("Common");

  return (
    <StyledHideArticleMenuButton
      showText={showText}
      onClick={toggleShowText}
      currentColorScheme={currentColorScheme}
      isVirtualKeyboardOpen={isVirtualKeyboardOpen}
      hideProfileBlock={hideProfileBlock}
    >
      {showText ? (
        <div
          className="article-hide-menu-container"
          id="document_catalog-hide-menu"
        >
          <ReactSVG
            className="article-hide-menu-icon_svg"
            src={ArticleHideMenuReactSvgUrl}
          />
          <Text
            className="article-hide-menu-text"
            fontWeight={600}
            fontSize="12px"
            noSelect
            truncate
          >
            {t("Common:HideArticleMenu")}
          </Text>
        </div>
      ) : (
        <div
          className="article-show-menu-container"
          id="document_catalog-show-menu"
        >
          <ReactSVG
            className="article-show-menu-icon_svg"
            src={ArticleShowMenuReactSvgUrl}
          />
        </div>
      )}
    </StyledHideArticleMenuButton>
  );
};

export default HideArticleMenuButton;
