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

import { Checkbox } from "@docspace/shared/components/checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import React, { useRef, useState } from "react";
import { ReactSVG } from "react-svg";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import classNames from "classnames";
import styles from "./FileTile.module.scss";
import { FileTileProps } from "./FileTile.types";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";
import { useTranslation } from "react-i18next";

const svgLoader = () => <div style={{ width: "96px" }} />;

const FileTile: React.FC<FileTileProps> = ({
  checked,
  children,
  contextButtonSpacerWidth,
  contextOptions,
  dragging,
  inProgress,
  isActive,
  item,
  element,
  onSelect,
  setSelection,
  sideColor,
  temporaryIcon,
  thumbnail,
  thumbnailClick,
  withCtrlSelect,
  withShiftSelect,
  tileContextClick,
  ...rest
}) => {
  const childrenArray = React.Children.toArray(children);
  const [FilesTileContent, badges] = childrenArray;

  const { t } = useTranslation(["Common"]);

  const [errorLoadSrc, setErrorLoadSrc] = useState(false);

  const cm = useRef(null);
  const tile = useRef(null);
  const checkboxContainerRef = useRef(null);

  const { isRTL } = useInterfaceDirection();

  const renderContext =
    hasOwnProperty(item, "contextOptions") &&
    contextOptions &&
    contextOptions?.length > 0;

  const contextMenuDirection = isRTL ? "left" : "right";

  const firstChild = childrenArray[0];
  const contextMenuHeader =
    React.isValidElement(firstChild) && firstChild.props?.item
      ? {
          icon: firstChild.props.item.icon,
          title: firstChild.props.item.title,
          color: firstChild.props.item.logo?.color,
          cover: firstChild.props.item.logo?.cover,
          logo: firstChild.props.item.logo?.medium,
        }
      : {};

  const getOptions = () => {
    tileContextClick && tileContextClick();
    return contextOptions;
  };

  const hideContextMenu = () => {
    cm.current?.hide();
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cm.current?.show(e);
  };

  const getContextModel = () => {
    return contextOptions || [];
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
      <Link type={LinkType.page} onClick={thumbnailClick}>
        {thumbnail && !errorLoadSrc ? (
          <img
            src={thumbnail}
            className={styles.thumbnailImage}
            alt="Thumbnail-img"
            onError={onError}
          />
        ) : (
          <ReactSVG
            className={styles.temporaryIcon}
            src={icon}
            loading={svgLoader}
          />
        )}
      </Link>
    );
  };

  const icon = getIconFile();

  const onFileClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      withCtrlSelect?.(item);
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      withShiftSelect(item);
      e.preventDefault();
      return;
    }

    if (
      e.detail === 1 &&
      !(e.target as HTMLElement).closest(".badges") &&
      !(e.target as HTMLElement).closest(".item-file-name") &&
      !(e.target as HTMLElement).closest(".tag")
    ) {
      if (
        (e.target as HTMLElement).nodeName !== "IMG" &&
        (e.target as HTMLElement).nodeName !== "INPUT" &&
        (e.target as HTMLElement).nodeName !== "rect" &&
        (e.target as HTMLElement).nodeName !== "path" &&
        (e.target as HTMLElement).nodeName !== "svg" &&
        checkboxContainerRef.current?.contains(e.target as Node)
      ) {
        setSelection && setSelection([]);
      }

      onSelect && onSelect(!checked, item);
    }
  };

  const onFileIconClick = () => {
    if (!isMobile) return;

    onSelect && onSelect(true, item);
  };

  const onCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect && onSelect(e.target.checked, item);
  };

  const fileTileClassNames = classNames(styles.fileTile, {
    [styles.inProgress]: inProgress,
  });

  const iconClassNames = classNames(styles.icon, {
    [styles.checked]: checked,
  });

  const checkboxClassNames = classNames(styles.checkbox, {
    [styles.checked]: checked,
  });

  return (
    <div
      {...rest}
      ref={tile}
      className={fileTileClassNames}
      onClick={onFileClick}
      className={fileTileClassNames}
      style={{ borderLeft: sideColor ? `4px solid ${sideColor}` : "none" }}
    >
      <div className={styles.fileTileTop}>{icon}</div>

      <div className={styles.fileTileBottom}>
        <div className={styles.iconContainer}>
          <div className={iconClassNames} onClick={onFileIconClick}>
            {element}
          </div>
          <Checkbox
            isChecked={checked}
            onChange={onCheckboxClick}
            className={checkboxClassNames}
          />
        </div>

        <div className={styles.content}>
          {FilesTileContent}
          {badges}
        </div>

        <div className={styles.optionButton}>
          {renderContext ? (
            <ContextMenuButton
              isFill
              className="expandButton"
              directionX={contextMenuDirection}
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
            onHide={hideContextMenu}
            getContextModel={getContextModel}
            ref={cm}
            header={contextMenuHeader}
            withBackdrop
          />
        </div>
      </div>
    </div>
  );
};

export { FileTile };
