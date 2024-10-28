// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { ReactSVG } from "react-svg";
import { Link } from "react-router-dom";

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
    badgeComponent,
    $currentColorScheme,
    title,
    linkData,
  } = props;

  const onClickAction = (e: React.MouseEvent) => {
    onClick?.(e, id);
  };
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return;

    onClickAction(e);
  };
  const onClickBadgeAction = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const tooltipTitle = !showText ? title : undefined;

  const renderItem = () => {
    return (
      <Link
        style={{ textDecoration: "none" }}
        to={linkData?.path}
        state={linkData?.state}
      >
        <StyledArticleItemTheme
          className={className}
          style={style}
          showText={showText}
          isEndOfBlock={isEndOfBlock}
          isActive={isActive}
          data-testid="article-item"
          $currentColorScheme={$currentColorScheme}
          title={tooltipTitle}
        >
          <StyledArticleItemSibling
            id={folderId}
            isActive={isActive}
            isDragging={isDragging}
            isDragActive={isDragActive}
            onClick={onClickAction}
            onMouseUp={onMouseUpAction}
            onMouseDown={onMouseDown}
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
              {badgeComponent || !iconBadge ? (
                (badgeComponent ?? (
                  <Badge className="catalog-item__badge" label={labelBadge} />
                ))
              ) : (
                <ReactSVG className="catalog-item__icon" src={iconBadge} />
              )}
            </StyledArticleItemBadgeWrapper>
          )}
        </StyledArticleItemTheme>
      </Link>
    );
  };

  return isHeader ? renderHeaderItem() : renderItem();
};

const ArticleItem = React.memo(ArticleItemPure);

export { ArticleItem };
