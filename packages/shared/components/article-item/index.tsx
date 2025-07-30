// (c) Copyright Ascensio System SIA 2009-2025
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
import classNames from "classnames";
import { isMobile } from "react-device-detect";

import { Text } from "../text";
import { Badge } from "../badge";

import styles from "./ArticleItem.module.scss";
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
    title,
    item,
    iconNode,
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
    if (isDragging) onDrop?.(id, text, item);
  };

  const renderHeaderItem = () => {
    return (
      <div
        className={classNames(styles.articleItemHeaderContainer, {
          [styles.showText]: showText,
          [styles.firstHeader]: isFirstHeader,
        })}
        data-testid="article-item-header"
      >
        <Text className={styles.articleItemHeaderText} truncate noSelect>
          {showText ? text : ""}
        </Text>
      </div>
    );
  };

  const tooltipTitle = !showText ? title : undefined;

  const renderItem = () => {
    return (
      <div
        className={classNames(styles.articleItemContainer, className, {
          [styles.showText]: showText,
          [styles.endOfBlock]: isEndOfBlock,
          [styles.active]: isActive,
        })}
        style={style}
        data-testid="article-item"
        title={tooltipTitle}
      >
        <div
          className={classNames(styles.articleItemSibling, {
            [styles.active]: isActive,
            [styles.dragging]: isDragging,
            [styles.dragActive]: isDragActive,
            [styles.mobileDevice]: isMobile,
          })}
          id={folderId}
          onClick={onClickAction}
          onMouseUp={onMouseUpAction}
          onMouseDown={onMouseDown}
          data-testid="article-item-sibling"
        />
        <div
          className={classNames(styles.articleItemImg, {
            [styles.active]: isActive,
          })}
        >
          {iconNode ? (
            <div className={styles.nodeIcon}>{iconNode}</div>
          ) : icon ? (
            <ReactSVG className={styles.icon} src={icon} />
          ) : null}
          {!showText ? (
            <>
              {showInitial ? (
                <Text className={styles.articleItemInitialText}>
                  {getInitial(text)}
                </Text>
              ) : null}
              {showBadge && !iconBadge ? (
                <div
                  className={classNames(styles.articleItemBadgeWrapper, {
                    [styles.showText]: showText,
                  })}
                  onClick={onClickBadgeAction}
                />
              ) : null}
            </>
          ) : null}
        </div>
        {showText ? (
          <Text
            className={classNames(styles.articleItemText, {
              [styles.active]: isActive,
            })}
            noSelect
          >
            {text}
          </Text>
        ) : null}
        {showBadge && showText ? (
          <div
            className={classNames(styles.articleItemBadgeWrapper, {
              [styles.showText]: showText,
            })}
            onClick={onClickBadgeAction}
            title={badgeTitle}
          >
            {iconBadge ? (
              <ReactSVG className={styles.articleItemIcon} src={iconBadge} />
            ) : (
              (badgeComponent ?? (
                <Badge className={styles.articleItemBadge} label={labelBadge} />
              ))
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return isHeader ? renderHeaderItem() : renderItem();
};

const ArticleItem = React.memo(ArticleItemPure);

export { ArticleItem };
