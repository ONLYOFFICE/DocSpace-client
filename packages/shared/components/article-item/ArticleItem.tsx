import React from "react";
import { ReactSVG } from "react-svg";

import { Text } from "../text";

import { Badge } from "../badge";

import {
  StyledArticleItemImg,
  StyledArticleItemSibling,
  StyledArticleItemBadgeWrapper,
  StyledArticleItemText,
  StyledArticleItemInitialText,
  StyledArticleItemHeaderContainer,
  StyledArticleItemTheme,
} from "./ArticleItem.styled";
import { ArticleItemProps } from "./ArticleItem.types";

const getInitial = (text: string) => text.substring(0, 1).toUpperCase();

export const ArticleItemPure = (props: ArticleItemProps) => {
  const {
    className,
    id,
    style,
    icon,
    text,
    showText = false,
    onClick,
    onDrop,
    isEndOfBlock = false,
    isActive = false,
    isDragging = false,
    isDragActive = false,
    showInitial = false,
    showBadge = false,
    labelBadge,
    iconBadge,
    onClickBadge,
    isHeader = false,
    isFirstHeader = false,
    folderId,
    badgeTitle,
  } = props;

  const onClickAction = () => {
    onClick?.(id);
  };

  const onClickBadgeAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickBadge?.(id);
  };

  const onMouseUpAction = () => {
    if (isDragging) onDrop?.(id, text);
  };

  const renderHeaderItem = () => {
    return (
      <StyledArticleItemHeaderContainer
        showText={showText}
        isFirstHeader={isFirstHeader}
      >
        <Text className="catalog-item__header-text" truncate noSelect>
          {showText ? text : ""}
        </Text>
      </StyledArticleItemHeaderContainer>
    );
  };

  const renderItem = () => {
    return (
      <StyledArticleItemTheme
        className={className}
        style={style}
        showText={showText}
        isEndOfBlock={isEndOfBlock}
        isActive={isActive}
        data-testid="article-item"
      >
        <StyledArticleItemSibling
          id={folderId}
          isActive={isActive}
          isDragging={isDragging}
          isDragActive={isDragActive}
          onClick={onClickAction}
          onMouseUp={onMouseUpAction}
        />
        <StyledArticleItemImg isActive={isActive}>
          <ReactSVG className="icon" src={icon} />
          {!showText && (
            <>
              {showInitial && (
                <StyledArticleItemInitialText>
                  {getInitial(text)}
                </StyledArticleItemInitialText>
              )}
              {showBadge && !iconBadge && (
                <StyledArticleItemBadgeWrapper
                  onClick={onClickBadgeAction}
                  showText={showText}
                />
              )}
            </>
          )}
        </StyledArticleItemImg>
        {showText && (
          <StyledArticleItemText isActive={isActive} noSelect>
            {text}
          </StyledArticleItemText>
        )}
        {showBadge && showText && (
          <StyledArticleItemBadgeWrapper
            showText={showText}
            onClick={onClickBadgeAction}
            title={badgeTitle}
          >
            {!iconBadge ? (
              <Badge className="catalog-item__badge" label={labelBadge} />
            ) : (
              <ReactSVG className="catalog-item__icon" src={iconBadge} />
            )}
          </StyledArticleItemBadgeWrapper>
        )}
      </StyledArticleItemTheme>
    );
  };

  return isHeader ? renderHeaderItem() : renderItem();
};

const ArticleItem = React.memo(ArticleItemPure);

export { ArticleItem };
