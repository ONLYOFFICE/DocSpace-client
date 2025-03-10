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

import React, { useState } from "react";
import styled, { css } from "styled-components";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { TextInput } from "@docspace/shared/components/text-input";

import {
  commonIconsStyles,
  injectDefaultTheme,
  tablet,
} from "@docspace/shared/utils";

import CheckIcon from "PUBLIC_DIR/images/check.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/12/cross.react.svg";

const StyledCheckIcon = styled(CheckIcon).attrs(injectDefaultTheme)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesEditingWrapper.fill} !important;
  }
  :hover {
    fill: ${(props) => props.theme.filesEditingWrapper.hoverFill} !important;
  }
`;

const StyledCrossIcon = styled(CrossIcon).attrs(injectDefaultTheme)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesEditingWrapper.fill} !important;
  }
  :hover {
    fill: ${(props) => props.theme.filesEditingWrapper.hoverFill} !important;
  }
`;

export const okIcon = <StyledCheckIcon className="edit-ok-icon" size="scale" />;
export const cancelIcon = (
  <StyledCrossIcon className="edit-cancel-icon" size="scale" />
);

const EditingWrapper = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  display: inline-flex;
  align-items: center;

  ${(props) =>
    props.viewAs === "table" &&
    css`
      grid-column-start: 1;
      grid-column-end: -1;

      border-bottom: ${({ theme }) => theme.filesEditingWrapper.borderBottom};
      padding-bottom: 4px;
      margin-top: 4px;
    `}

  ${(props) =>
    props.viewAs === "tile" &&
    css`
      position: absolute;
      width: calc(100% - 18px);
      z-index: 1;
      gap: 4px;

      background-color: ${({ theme }) =>
        theme.filesEditingWrapper.tile.background};

      border: ${({ theme }) => theme.filesEditingWrapper.border};
      border-radius: ${({ isFolder }) => (isFolder ? "6px" : "0 0 6px 6px")};

      height: 43px;
      bottom: 0;
      inset-inline: 0;
      padding: 9px 8px;
    `}


  @media ${tablet} {
    height: ${(props) => (props.viewAs === "tile" ? "43px" : "56px")};
  }

  .edit-text {
    height: 32px;
    font-size: ${(props) =>
      props.viewAs === "table"
        ? "13px"
        : props.viewAs === "tile"
          ? "14px"
          : "15px"};
    outline: 0 !important;
    font-weight: 600;
    margin: 0;
    font-family: ${(props) => props.theme.fontFamily};
    text-align: start;
    color: ${(props) => props.theme.filesEditingWrapper.color};
    background: ${(props) =>
      props.theme.filesEditingWrapper.row.itemBackground} !important;

    ${(props) =>
      props.viewAs === "tile" &&
      css`
        margin-inline-end: 2px;
        border: none;
        background: none;
      `};

    ${(props) =>
      props.isUpdatingRowItem &&
      css`
        margin-inline-start: 0;
        display: flex;
        align-items: center;
        background: none !important;
      `}

    ${(props) => props.viewAs === "table" && `padding-inline-start: 12px`}

    ${(props) =>
      props.viewAs === "tile" &&
      !props.isUpdatingRowItem &&
      css`
        background: ${({ theme }) =>
          theme.filesEditingWrapper.tile.itemBackground};
        border: ${({ theme }) =>
          `1px solid ${theme.filesEditingWrapper.tile.itemBorder}`};

        &:focus {
          border: ${({ theme }) =>
            `1px solid ${theme.filesEditingWrapper.tile.itemActiveBorder}`};
        }
      `};

    ${({ isDisabled }) =>
      isDisabled &&
      `background-color: ${({ theme }) => theme.filesEditingWrapper.disabledBackground}`}
  }

  .edit-button {
    margin-inline-start: 8px;
    height: 32px;
    padding: 0px 7px;

    ${(props) =>
      props.viewAs === "tile" &&
      css`
        margin-inline-start: 0;
        background: ${({ theme }) =>
          theme.filesEditingWrapper.tile.itemBackground};
        border: ${({ theme }) =>
          `1px solid ${theme.filesEditingWrapper.tile.itemBorder}`};

        &:hover {
          border: ${({ theme }) =>
            `1px solid ${theme.filesEditingWrapper.tile.itemActiveBorder}`};
        }
      `};

    ${(props) =>
      props.viewAs === "table" &&
      css`
        width: 24px;
        height: 24px;
        border: 1px transparent;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border: ${({ theme }) => theme.filesEditingWrapper.border};
        }
      `}
  }

  .edit-ok-icon {
    width: 16px;
    height: 16px;
  }

  .edit-cancel-icon {
    width: 14px;
    height: 14px;
    padding: 1px;
  }
`;

const EditingWrapperComponent = (props) => {
  const {
    itemTitle,
    itemId,
    renameTitle,
    onClickUpdateItem,
    cancelUpdateItem,
    // isLoading,
    viewAs,
    elementIcon,
    isUpdatingRowItem,
    passwordEntryProcess,
    isFolder,
  } = props;

  const isTable = viewAs === "table";

  const [OkIconIsHovered, setIsHoveredOk] = useState(false);
  const [CancelIconIsHovered, setIsHoveredCancel] = useState(false);
  const [isTouchOK, setIsTouchOK] = useState(false);
  const [isTouchCancel, setIsTouchCancel] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const inputRef = React.useRef(null);

  const onKeyUpUpdateItem = (e) => {
    if (isLoading) return;

    const code = e.keyCode || e.which;
    if (code === 13) {
      if (!isLoading) setIsLoading(true);
      return onClickUpdateItem(e);
    }
  };
  const onEscapeKeyPress = (e) => {
    if (e.keyCode === 27) return cancelUpdateItem(e);
  };

  const setIsHoveredOkHandler = () => {
    setIsHoveredOk(!OkIconIsHovered);
  };

  const setIsHoveredCancelHandler = () => {
    setIsHoveredCancel(!CancelIconIsHovered);
  };

  const onFocus = (e) => e.target.select();
  const onBlur = (e) => {
    if (
      (e.relatedTarget && e.relatedTarget.classList.contains("edit-button")) ||
      OkIconIsHovered ||
      CancelIconIsHovered ||
      isTouchOK ||
      isTouchCancel
    )
      return false;

    if (!document.hasFocus() && inputRef.current === e.target) return false;

    !passwordEntryProcess && onClickUpdateItem(e, false);
  };

  return (
    <EditingWrapper
      viewAs={viewAs}
      isUpdatingRowItem={isUpdatingRowItem ? !isTable : null}
      isFolder={isFolder}
      isDisabled={isLoading}
    >
      {isTable ? elementIcon : null}
      {isUpdatingRowItem && !isTable ? (
        <Text className="edit-text">{itemTitle}</Text>
      ) : (
        <TextInput
          className="edit-text"
          name="title"
          scale
          value={itemTitle}
          tabIndex={1}
          isAutoFocussed
          onChange={renameTitle}
          onKeyPress={onKeyUpUpdateItem}
          onKeyDown={onEscapeKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
          isDisabled={isLoading}
          data-itemid={itemId}
          withBorder={!isTable}
          forwardedRef={inputRef}
        />
      )}
      {!isUpdatingRowItem ? (
        <>
          <Button
            className="edit-button not-selectable"
            size="small"
            isDisabled={isLoading}
            onClick={onClickUpdateItem}
            icon={okIcon}
            data-itemid={itemId}
            onMouseEnter={setIsHoveredOkHandler}
            onMouseLeave={setIsHoveredOkHandler}
            onTouchStart={() => setIsTouchOK(true)}
            isHovered={OkIconIsHovered}
            title=""
          />
          <Button
            className="edit-button not-selectable"
            size="medium"
            isDisabled={isLoading}
            onClick={cancelUpdateItem}
            icon={cancelIcon}
            data-itemid={itemId}
            data-action="cancel"
            onMouseEnter={setIsHoveredCancelHandler}
            onMouseLeave={setIsHoveredCancelHandler}
            onTouchStart={() => setIsTouchCancel(true)}
            isHovered={CancelIconIsHovered}
            title=""
          />
        </>
      ) : null}
    </EditingWrapper>
  );
};

export default EditingWrapperComponent;
