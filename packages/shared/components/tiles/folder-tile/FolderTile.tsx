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
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { isMobile } from "react-device-detect";
import { Checkbox } from "../../checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import { FolderChildProps, FolderTileProps } from "./FolderTile.types";
import { hasOwnProperty } from "../../../utils/object";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";
import { HeaderType } from "../../context-menu/ContextMenu.types";
import { Loader, LoaderTypes } from "../../loader";

import styles from "./FolderTile.module.scss";

export const FolderTile = ({
  item,
  checked,
  inProgress,
  onSelect,
  indeterminate,
  getContextModel,
  setSelection,
  withCtrlSelect,
  withShiftSelect,
  children,
  element,
  badges,
  contextOptions,
  tileContextClick,
  hideContextMenu,
  showHotkeyBorder,
  isDragging,
  isActive,
  isEdit,
  forwardRef,
  dataTestId,
}: FolderTileProps) => {
  const childrenArray = React.Children.toArray(children);
  const [FolderTileContent] = childrenArray;

  const { t } = useTranslation(["Translations"]);

  const cmRef = useRef<ContextMenuRefType>(null);

  const { isRTL } = useInterfaceDirection();
  const contextMenuDirection = isRTL ? "left" : "right";

  const renderContext =
    hasOwnProperty(item, "contextOptions") &&
    contextOptions &&
    contextOptions?.length > 0;

  const firstChild = childrenArray[0] as React.ReactElement<FolderChildProps>;
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

  const changeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(e.target.checked, item);
  };

  const onFolderIconClick = () => {
    if (!isMobile) return;
    if (onSelect) {
      onSelect(true, item);
    }
  };

  const getOptions = () => {
    if (tileContextClick) {
      tileContextClick();
    }
    return contextOptions;
  };

  const onFolderClick = (e: React.MouseEvent) => {
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

  const folderTileClassNames = classNames(styles.folderTile, {
    [styles.checked]: checked,
    [styles.showHotkeyBorder]: showHotkeyBorder,
    [styles.isDragging]: isDragging,
    [styles.isActive]: isActive,
    [styles.isEdit]: isEdit,
  });

  const iconContainerClassNames = classNames(styles.iconContainer, {
    [styles.isDragging]: isDragging,
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
      className={folderTileClassNames}
      onClick={onFolderClick}
      ref={forwardRef}
      onContextMenu={onContextMenu}
      data-testid={dataTestId ?? "tile"}
    >
      {element && !isEdit ? (
        !inProgress ? (
          <div className={iconContainerClassNames}>
            <div className={iconClassNames} onClick={onFolderIconClick}>
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

      <div className={styles.content}>
        {FolderTileContent}
        {badges}
      </div>

      <div className={styles.optionButton}>
        {renderContext ? (
          <ContextMenuButton
            isFill
            className={classNames(styles.expandButton, "expandButton")}
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
          model={contextOptions}
          onHide={hideContextMenu}
          getContextModel={getContextModel}
          ref={cmRef}
          header={contextMenuHeader}
          withBackdrop
        />
      </div>
    </div>
  );
};

export default FolderTile;
