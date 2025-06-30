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

import React, { useRef } from "react";
import { isMobile } from "react-device-detect";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Checkbox } from "../../checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import { hasOwnProperty } from "../../../utils/object";
import { HeaderType } from "../../context-menu/ContextMenu.types";
import { Loader, LoaderTypes } from "../../loader";

import { BaseTileProps, TileChildProps } from "./BaseTile.types";

import styles from "./BaseTile.module.scss";

export const BaseTile = ({
  checked,
  isActive,
  isBlockingOperation,
  item,
  onSelect,
  getContextModel,
  indeterminate,
  element,
  contextOptions,
  tileContextClick,
  hideContextMenu,
  inProgress,
  showHotkeyBorder,
  isEdit,
  topContent,
  bottomContent,
  isHovered,
  onHover,
  onLeave,
  className,
  onRoomClick,
  checkboxContainerRef,
  forwardRef,
}: BaseTileProps) => {
  const childrenArray = React.Children.toArray(topContent);

  const { t } = useTranslation(["Translations"]);

  const cmRef = useRef<ContextMenuRefType>(null);

  const renderContext =
    hasOwnProperty(item, "contextOptions") &&
    contextOptions &&
    contextOptions?.length > 0;

  const firstChild = childrenArray[0] as React.ReactElement<TileChildProps>;
  const contextMenuHeader: HeaderType | undefined =
    React.isValidElement(firstChild) && firstChild.props?.item
      ? {
          title:
            firstChild.props.item.title ||
            firstChild.props.item.displayName ||
            "",
          icon: firstChild.props.item.icon,
          original: firstChild.props.item.logo?.original || "",
          large: firstChild.props.item.logo?.large || "",
          medium: firstChild.props.item.logo?.medium || "",
          small: firstChild.props.item.logo?.small || "",
          color: firstChild.props.item.logo?.color,
          cover: firstChild.props.item.logo?.cover
            ? typeof firstChild.props.item.logo.cover === "string"
              ? {
                  data: firstChild.props.item.logo.cover,
                  id: "",
                }
              : firstChild.props.item.logo.cover
            : undefined,
        }
      : undefined;

  const getOptions = () => {
    if (tileContextClick) {
      tileContextClick();
    }
    return contextOptions;
  };

  const changeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(e.target.checked, item);
  };

  const onRoomIconClick = () => {
    if (!isMobile) return;
    onSelect?.(true, item);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (tileContextClick) {
      tileContextClick(e.button === 2);
    }

    if (!cmRef.current?.menuRef.current && forwardRef?.current) {
      forwardRef.current.click();
    }

    if (getContextModel && cmRef.current) {
      cmRef.current.show(e);
    }
  };

  const tileClassName = classNames(styles.baseTile, className, {
    [styles.checked]: checked,
    [styles.isActive]: isActive,
    [styles.isBlockingOperation]: isBlockingOperation,
    [styles.showHotkeyBorder]: showHotkeyBorder,
    [styles.isEdit]: isEdit,
  });

  const iconContainerClassNames = classNames(
    styles.iconContainer,
    "iconContainer",
    {
      [styles.inProgress]: inProgress,
    },
  );

  const iconClassNames = classNames(styles.icon, {
    [styles.checked]: checked,
  });

  const checkboxClassNames = classNames(styles.checkbox, "checkbox", {
    [styles.checked]: checked,
  });

  const contentClassNames = classNames(styles.content, "content", {
    [styles.isHovered]: isHovered,
  });

  return (
    <div
      className={tileClassName}
      onClick={onRoomClick}
      onContextMenu={onContextMenu}
    >
      <div className={styles.topContent}>
        {element && !isEdit ? (
          !inProgress ? (
            <div
              className={iconContainerClassNames}
              ref={checkboxContainerRef}
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            >
              <div className={iconClassNames} onClick={onRoomIconClick}>
                {element}
              </div>
              <Checkbox
                isChecked={checked}
                onChange={changeCheckbox}
                className={checkboxClassNames}
                isIndeterminate={indeterminate}
              />
            </div>
          ) : (
            <Loader
              className={styles.loader}
              color=""
              size="20px"
              type={LoaderTypes.track}
            />
          )
        ) : null}

        <div className={contentClassNames}>{topContent}</div>

        <div
          className={styles.optionButton}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {renderContext ? (
            <ContextMenuButton
              isFill
              className={classNames(styles.expandButton, "expandButton")}
              directionX="right"
              getData={getOptions}
              displayType={ContextMenuButtonDisplayType.toggle}
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e);
              }}
              title={t("Translations:TitleShowFolderActions")}
            />
          ) : (
            <div className="expandButton" />
          )}
          <ContextMenu
            model={contextOptions}
            onHide={hideContextMenu}
            getContextModel={getContextModel}
            ref={cmRef}
            header={contextMenuHeader}
            withBackdrop
          />
        </div>
      </div>

      <div className={classNames(styles.bottomContent, "bottomContent")}>
        {bottomContent}
      </div>
    </div>
  );
};
