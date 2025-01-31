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

"use client";

import React, { useRef } from "react";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow2.react.svg?url";
import { isMobile } from "react-device-detect"; // TODO: isDesktop=true for IOS(Firefox & Safari)
import classNames from "classnames";
import { IconSizeType } from "../../../utils";

import { VDRIndexingAction } from "../../../enums";
import { isMobile as isMobileUtils } from "../../../utils/device";

import { Checkbox } from "../../checkbox";
import { ColorTheme, ThemeId } from "../../color-theme";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import { Loader, LoaderTypes } from "../../loader";
import { RowProps } from "./Row.types";
import { hasOwnProperty } from "../../../utils/object";
import styles from "./Row.module.scss";

const Row = (props: RowProps) => {
  const {
    checked,
    children,
    contentElement,
    contextButtonSpacerWidth = "26px",
    data,
    element,
    indeterminate,
    onSelect,
    onRowClick,
    onContextClick,
    onChangeIndex,

    getContextModel,
    isRoom,
    withoutBorder = false,
    contextTitle,
    badgesComponent,
    isArchive,
    mode = "default",
    inProgress,
    rowContextClose,
    className,
    badgeUrl,
    isDisabled,
    isIndexEditingMode,
  } = props;

  const cm = useRef<ContextMenuRefType>(null);
  const row = useRef<null | HTMLDivElement>(null);

  const renderCheckbox = hasOwnProperty(props, "checked");

  const renderElement = hasOwnProperty(props, "element");

  const renderContentElement = hasOwnProperty(props, "contentElement");

  const contextData = data?.contextOptions ? data : props;

  const renderContext =
    hasOwnProperty(contextData, "contextOptions") &&
    contextData &&
    contextData.contextOptions &&
    contextData.contextOptions.length > 0;

  const changeCheckbox = () => {
    onSelect?.(!checked, data);
  };

  const getOptions = () => {
    onContextClick?.();
    return contextData.contextOptions || [];
  };

  const onContextMenu = (e: React.MouseEvent) => {
    onContextClick?.(e.button === 2);
    if (!cm.current?.menuRef.current) {
      if (row.current) row.current.click(); // TODO: need fix context menu to global
    }
    if (cm.current) cm.current.show(e);
  };

  let contextMenuHeader;
  if (React.isValidElement(children) && children.props.item) {
    contextMenuHeader = {
      icon: children.props.item.icon,
      avatar: children.props.item.avatar,
      title: children.props.item.title
        ? children.props.item.title
        : children.props.item.displayName || "",
      color: children.props.item.logo?.color,
      logo: children.props.item.logo?.medium,
      cover: children.props.item.logo?.cover,
      original: "",
      large: "",
      medium: "",
      small: "",
    };
  }

  const onElementClick = () => {
    if (!isMobile) return;

    onSelect?.(true, data);
  };

  const changeIndex = (
    e: React.MouseEvent<HTMLElement>,
    action: VDRIndexingAction,
  ) => {
    e.stopPropagation();
    onChangeIndex(action);
  };

  return (
    <div
      ref={row}
      onContextMenu={onContextMenu}
      className={classNames(
        styles.row,
        {
          [styles.withoutBorder]: withoutBorder,
          [styles.modern]: mode === "modern",
          [styles.checked]: checked,
        },
        className,
      )}
      data-testid="row"
    >
      {inProgress ? (
        <Loader
          className={classNames(
            styles.rowProgressLoader,
            "row-progress-loader",
          )}
          color=""
          size="20px"
          type={LoaderTypes.track}
        />
      ) : (
        <>
          {mode === "default" && renderCheckbox ? (
            <div
              className={classNames(
                styles.checkboxElement,
                { [styles.isIndexEditingMode]: isIndexEditingMode },
                "not-selectable",
              )}
            >
              <Checkbox
                className="checkbox"
                isChecked={checked}
                isIndeterminate={indeterminate}
                onChange={changeCheckbox}
                isDisabled={isDisabled}
              />
            </div>
          ) : null}
          {mode === "modern" && renderCheckbox && renderElement ? (
            <div
              className={classNames(
                styles.checkboxElement,
                {
                  [styles.isIndexEditingMode]: isIndexEditingMode,
                  [styles.modern]: mode === "modern",
                  [styles.checked]: checked,
                },
                "not-selectable styled-checkbox-container",
              )}
            >
              <div
                onClick={onElementClick}
                className={classNames(styles.element, "styled-element")}
              >
                {element}
              </div>
              <Checkbox
                className={classNames(styles.checkbox, "checkbox")}
                isChecked={checked}
                isIndeterminate={indeterminate}
                onChange={changeCheckbox}
                isDisabled={isDisabled}
              />
            </div>
          ) : null}

          {mode === "default" && renderElement ? (
            <div
              onClick={onRowClick}
              className={classNames(styles.element, "styled-element")}
            >
              {element}
            </div>
          ) : null}
        </>
      )}

      <div
        className={classNames(styles.content, "row_content")}
        onClick={onRowClick}
      >
        {children}
      </div>
      <div
        className={classNames(styles.optionButton, "row_context-menu-wrapper")}
        style={{ ["--manual-width" as string]: contextButtonSpacerWidth }}
      >
        {badgesComponent || null}
        {renderContentElement ? (
          <div className={styles.contentElement}>{contentElement}</div>
        ) : null}
        {isIndexEditingMode ? (
          <>
            <ColorTheme
              themeId={ThemeId.IndexIconButton}
              iconName={ArrowReactSvgUrl}
              className="index-up-icon"
              size={IconSizeType.small}
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                changeIndex(e, VDRIndexingAction.HigherIndex)
              }
            />
            <ColorTheme
              themeId={ThemeId.IndexIconButton}
              iconName={ArrowReactSvgUrl}
              className="index-down-icon"
              size={IconSizeType.small}
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                changeIndex(e, VDRIndexingAction.LowerIndex)
              }
            />
          </>
        ) : (
          <>
            {renderContext ? (
              <ContextMenuButton
                isFill
                className="expandButton"
                getData={getOptions}
                directionX="right"
                displayType={ContextMenuButtonDisplayType.toggle}
                onClick={onContextMenu}
                title={contextTitle}
              />
            ) : (
              <div className="expandButton"> </div>
            )}
            <ContextMenu
              getContextModel={getContextModel}
              model={contextData.contextOptions || []}
              ref={cm}
              header={contextMenuHeader}
              withBackdrop={isMobileUtils()}
              onHide={rowContextClose}
              isRoom={isRoom}
              isArchive={isArchive}
              badgeUrl={badgeUrl}
            />
          </>
        )}
      </div>
    </div>
  );
};

export { Row };
