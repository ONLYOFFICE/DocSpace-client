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

import React, { useState, useRef } from "react";
import { ReactSVG } from "react-svg";
import { isMobile } from "react-device-detect";
import classNames from "classnames";

import { Checkbox } from "@docspace/shared/components/checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { Tags } from "@docspace/shared/components/tags";

import styles from "./RoomTile.module.scss";
import { RoomTileProps } from "./RoomTile.types";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { useTranslation } from "react-i18next";
import { HeaderType } from "components/context-menu/ContextMenu.types";

const svgLoader = () => <div style={{ width: "96px" }} />;

export const RoomTile = ({
  checked,
  isActive,
  isBlockingOperation,
  item,
  onSelect,
  thumbnailClick,
  thumbnail,
  temporaryIcon,
  getContextModel,
  indeterminate,
  children,
  element,
  contextOptions,
  tileContextClick,
  hideContextMenu,
  columnCount,
  selectTag,
  selectOption,
  getRoomTypeName,
}: RoomTileProps) => {
  const childrenArray = React.Children.toArray(children);
  const [RoomsTileContent, badges] = childrenArray;

  const { t } = useTranslation(["Translations"]);

  const [errorLoadSrc, setErrorLoadSrc] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cmRef = useRef<any>(null);
  const checkboxContainerRef = useRef<HTMLDivElement>(null);

  const renderContext =
    hasOwnProperty(item, "contextOptions") &&
    contextOptions &&
    contextOptions?.length > 0;

  const firstChild = childrenArray[0];
  const contextMenuHeader: HeaderType | undefined =
    React.isValidElement(firstChild) && firstChild.props?.item
      ? {
          title: firstChild.props.item.title,
          icon: firstChild.props.item.icon,
          original: firstChild.props.item.logo?.original,
          large: firstChild.props.item.logo?.large,
          medium: firstChild.props.item.logo?.medium,
          small: firstChild.props.item.logo?.small,
          color: firstChild.props.item.logo?.color,
          cover: firstChild.props.item.logo?.cover,
        }
      : undefined;

  const onHover = () => {
    setIsHovered(true);
  };

  const onLeave = () => {
    setIsHovered(false);
  };

  const onError = () => {
    setErrorLoadSrc(true);
  };

  const getOptions = () => {
    tileContextClick && tileContextClick();
    return contextOptions;
  };

  const changeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(e.target.checked, item);
  };

  const onRoomIconClick = () => {
    if (!isMobile) return;
    onSelect?.(true, item);
  };

  const onRoomClick = (e: React.MouseEvent) => {
    if (
      !e.target ||
      !(e.target instanceof Element) ||
      (!e.target.closest(".checkbox") &&
        !e.target.closest(".tags") &&
        !e.target.closest(".advanced-tag") &&
        !e.target.closest(".badges") &&
        !e.target.closest("#modal-dialog"))
    ) {
      thumbnailClick?.(e);
    }
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    getContextModel && cmRef.current?.show(e);
  };

  const tags = [];

  if (item.providerType) {
    tags.push({
      isThirdParty: true,
      icon: item.thirdPartyIcon,
      label: item.providerKey,
      providerType: item.providerType,
      onClick: () =>
        selectOption({
          option: "typeProvider",
          value: item.providerType,
        }),
    });
  }

  if (item?.tags?.length > 0) {
    tags.push(...item.tags);
  } else {
    tags.push({
      isDefault: true,
      roomType: item.roomType,
      label: getRoomTypeName(item.roomType, t),
      onClick: () =>
        selectOption({
          option: "defaultTypeRoom",
          value: item.roomType,
        }),
    });
  }

  const tileClassName = classNames(styles.roomTile, {
    [styles.checked]: checked,
    [styles.isActive]: isActive,
    [styles.isBlockingOperation]: isBlockingOperation,
  });

  const iconClassNames = classNames(styles.icon, {
    [styles.checked]: checked,
  });

  const checkboxClassNames = classNames(styles.checkbox, {
    [styles.checked]: checked,
  });

  const contentClassNames = classNames(styles.content, {
    [styles.isHovered]: isHovered,
  });

  return (
    <div
      className={tileClassName}
      onClick={onRoomClick}
      onContextMenu={onContextMenu}
    >
      <div className={styles.topContent}>
        <div
          className={styles.iconContainer}
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

        <div className={contentClassNames}>
          {RoomsTileContent}
          <div onMouseEnter={onHover} onMouseLeave={onLeave}>
            {badges}
          </div>
        </div>

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

      <div className={styles.bottomContent}>
        <Tags
          columnCount={columnCount}
          onSelectTag={selectTag}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          tags={tags}
          className="room-tags"
        />
      </div>
    </div>
  );
};
