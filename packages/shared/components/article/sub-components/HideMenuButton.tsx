import React from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import ArticleHideMenuReactSvgUrl from "PUBLIC_DIR/images/article-hide-menu.react.svg?url";
import ArticleShowMenuReactSvgUrl from "PUBLIC_DIR/images/article-show-menu.react.svg?url";

import { Text } from "../../text";
import { ArticleHideMenuButtonProps } from "../Article.types";
import { StyledHideArticleMenuButton } from "../Article.styled";

const HideArticleMenuButton = ({
  showText,
  toggleShowText,
  currentColorScheme,
  isVirtualKeyboardOpen,
  hideProfileBlock,
}: ArticleHideMenuButtonProps) => {
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
