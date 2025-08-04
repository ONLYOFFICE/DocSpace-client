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

import React, { useRef, useState } from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import { Checkbox } from "../../checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import { HeaderType } from "../../context-menu/ContextMenu.types";
import { Link, LinkType } from "../../link";
import { Loader, LoaderTypes } from "../../loader";
import { hasOwnProperty } from "../../../utils/object";
import { isMobile, classNames, isTablet } from "../../../utils";

import { FileChildProps, FileTileProps } from "./FileTile.types";

import styles from "./FileTile.module.scss";

const svgLoader = () => <div style={{ width: "96px" }} />;

const FileTile = ({
  checked,
  children,
  contextButtonSpacerWidth,
  contextOptions,
  contentElement,
  inProgress,
  item,
  element,
  onSelect,
  setSelection,
  sideColor,
  temporaryIcon,
  thumbnail,
  thumbSize,
  isHighlight,
  isBlockingOperation,
  showHotkeyBorder,
  isDragging,
  isActive,
  thumbnailClick,
  withCtrlSelect,
  withShiftSelect,
  tileContextClick,
  getContextModel,
  hideContextMenu,
  badges,
  isEdit,
  forwardRef,
  ...rest
}: FileTileProps) => {
  const childrenArray = React.Children.toArray(children);
  const [FilesTileContent] = childrenArray;

  const { t } = useTranslation(["Translations"]);

  const [errorLoadSrc, setErrorLoadSrc] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cm = useRef<ContextMenuRefType>(null);

  const onHover = () => {
    setIsHovered(true);
  };

  const onLeave = () => {
    setIsHovered(false);
  };

  const renderContext =
    hasOwnProperty(item, "contextOptions") &&
    contextOptions &&
    contextOptions.length > 0;

  const firstChild = childrenArray[0] as React.ReactElement<FileChildProps>;
  const contextMenuHeader: HeaderType | undefined =
    React.isValidElement(firstChild) && firstChild.props?.item
      ? {
          title: firstChild.props.item.title || "",
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

  const onContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (tileContextClick) {
      tileContextClick(e.button === 2);
    }

    if (!cm.current?.menuRef.current && forwardRef?.current) {
      forwardRef.current.click();
    }

    if (getContextModel && cm.current) {
      cm.current.show(e);
    }
  };

  const onError = () => {
    setErrorLoadSrc(true);
  };

  const getIconFile = () => {
    const icon = item.isPlugin
      ? item.fileTileIcon
      : thumbnail && !errorLoadSrc
        ? thumbnail
        : temporaryIcon;

    return (
      <Link type={LinkType.page}>
        {thumbnail && !errorLoadSrc ? (
          thumbSize !== null ? (
            <img
              src={thumbnail}
              className={styles.thumbnailImage}
              alt="Thumbnail-img"
              onError={onError}
              data-testid="file-thumbnail"
            />
          ) : (
            <ReactSVG
              className={styles.temporaryIcon}
              src=""
              loading={svgLoader}
              data-testid="file-thumbnail"
            />
          )
        ) : (
          <ReactSVG
            className={styles.temporaryIcon}
            src={icon ?? ""}
            loading={svgLoader}
            data-testid="file-thumbnail"
          />
        )}
      </Link>
    );
  };

  const icon = getIconFile();

  const onFileClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (withCtrlSelect) {
        withCtrlSelect(item);
      }
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      if (withShiftSelect) {
        withShiftSelect(item);
      }
      e.preventDefault();
      return;
    }

    if (
      e.detail === 1 &&
      !(e.target as HTMLElement).closest(".badges") &&
      !(e.target as HTMLElement).closest(".item-file-name") &&
      !(e.target as HTMLElement).closest(".tag") &&
      !(e.target as HTMLElement).closest(`.${styles.checkbox}`)
    ) {
      if (
        (e.target as HTMLElement).nodeName !== "IMG" &&
        (e.target as HTMLElement).nodeName !== "INPUT" &&
        (e.target as HTMLElement).nodeName !== "rect" &&
        (e.target as HTMLElement).nodeName !== "path" &&
        (e.target as HTMLElement).nodeName !== "svg"
      ) {
        if (setSelection) {
          setSelection([]);
        }
      }

      if (onSelect) {
        onSelect(!checked, item);
      }
    }
  };

  const onFileIconClick = () => {
    if (!isMobile()) return;

    if (onSelect) {
      onSelect(true, item);
    }
  };

  const onCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(e.target.checked, item);
    }
  };

  const isImageOrMedia =
    item?.viewAccessibility?.ImageView || item?.viewAccessibility?.MediaView;

  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const fileTileClassNames = classNames(styles.fileTile, {
    [styles.isBlocked]: isBlockingOperation,
    [styles.showHotkeyBorder]: showHotkeyBorder,
    [styles.isDragging]: isDragging,
    [styles.isActive]: isActive,
    [styles.checked]: checked,
    [styles.isEdit]: isEdit,
    [styles.isTouchDevice]: isTouchDevice || isMobile() || isTablet(),
  });

  const iconClassNames = classNames(styles.icon, {
    [styles.checked]: checked,
  });

  const iconContainerClassNames = classNames(styles.iconContainer, {
    [styles.isDragging]: isDragging,
    [styles.inProgress]: inProgress,
    [styles.checked]: checked,
  });

  const checkboxClassNames = classNames(styles.checkbox, {
    [styles.checked]: checked,
  });

  const fileTileTopClassNames = classNames(styles.fileTileTop, {
    [styles.isImageOrMedia]: isImageOrMedia,
  });

  const fileTileBottomClassNames = classNames(styles.fileTileBottom, {
    [styles.isHighlight]: isHighlight,
  });

  const contentClassNames = classNames(styles.content, "content", {
    [styles.isHovered]: isHovered,
  });

  return (
    <div
      {...rest}
      ref={forwardRef}
      className={fileTileClassNames}
      onContextMenu={onContextMenu}
      onClick={onFileClick}
    >
      <div className={fileTileTopClassNames} onClick={thumbnailClick}>
        {icon}
      </div>

      {contentElement ? (
        <div
          className={classNames(styles.icons, styles.isQuickButtons)}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {contentElement}
        </div>
      ) : null}
      <div
        className={classNames(styles.icons, styles.isBadges)}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {badges}
      </div>

      <div className={fileTileBottomClassNames}>
        {element && !isEdit ? (
          !inProgress ? (
            <div
              className={iconContainerClassNames}
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            >
              <div className={iconClassNames} onClick={onFileIconClick}>
                {element}
              </div>
              <Checkbox
                isChecked={checked}
                onChange={onCheckboxClick}
                className={checkboxClassNames}
              />
            </div>
          ) : (
            <Loader
              className={styles.loader}
              color=""
              size="20px"
              type={LoaderTypes.track}
              data-testid="loader"
            />
          )
        ) : null}

        <div className={contentClassNames}>{FilesTileContent}</div>

        <div
          className={styles.optionButton}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {renderContext ? (
            <ContextMenuButton
              isFill
              className={classNames(styles.expandButton, "expandButton")}
              directionX="left"
              getData={getOptions}
              displayType={ContextMenuButtonDisplayType.toggle}
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e);
              }}
              title={t("Translations:TitleShowActions")}
            />
          ) : (
            <div className="expandButton" />
          )}
          <ContextMenu
            model={contextOptions}
            onHide={hideContextMenu}
            getContextModel={getContextModel}
            ref={cm}
            header={contextMenuHeader}
            withBackdrop={isMobile()}
          />
        </div>
      </div>
    </div>
  );
};

export { FileTile };
