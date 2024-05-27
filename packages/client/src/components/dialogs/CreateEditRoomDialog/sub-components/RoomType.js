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

import { inject, observer } from "mobx-react";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";
import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";

import { RoomLogo } from "@docspace/shared/components/room-logo";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";
import { Base } from "@docspace/shared/themes";
import {
  getRoomTypeDescriptionTranslation,
  getRoomTypeTitleTranslation,
} from "./../data/index";

const StyledRoomType = styled.div`
  cursor: pointer;
  user-select: none;
  outline: 0;

  padding: 16px;
  width: 100%;
  box-sizing: border-box;

  display: flex;
  gap: 12px;
  align-items: center;

  .choose_room-logo_wrapper {
    width: 32px;
    margin-bottom: auto;
  }

  .choose_room-info_wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .choose_room-title {
      display: flex;
      flex-direction: row;
      gap: 6px;
      align-items: center;
      .choose_room-title-text {
        font-weight: 600;
        font-size: 14px;
        line-height: 16px;
      }
    }
    .choose_room-description {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
    }
  }

  .choose_room-forward_btn {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
            transform: scaleX(-1);
          `
        : css`
            margin-left: auto;
          `}
    max-width: 17px;
    max-height: 17px;
    min-width: 17px;
    min-height: 17px;
  }
`;

const StyledListItem = styled(StyledRoomType)`
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.listItem.background};
  border: 1px solid
    ${(props) => props.theme.createEditRoomDialog.roomType.listItem.borderColor};
  border-radius: 6px;

  &:hover:not(:active) {
    background-color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.listItem.hoverBackground};
  }

  &:active {
    border-color: ${({ accentColor }) => accentColor};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.listItem.descriptionText};
  }
`;

const StyledDropdownButton = styled(StyledRoomType)`
  border-radius: 6px;
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.dropdownButton.background};

  ${({ isOpen }) =>
    !isOpen &&
    css`
      &:hover:not(:active) {
        background-color: ${(props) =>
          props.theme.createEditRoomDialog.roomType.dropdownButton
            .hoverBackground};
      }
    `}

  border: 1px solid
    ${({ isOpen, accentColor, theme }) =>
    isOpen
      ? accentColor
      : theme.createEditRoomDialog.roomType.dropdownButton.borderColor};

  &:active {
    border-color: ${({ accentColor }) => accentColor};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownButton.descriptionText};
  }

  .choose_room-forward_btn {
    &.dropdown-button {
      transform: ${(props) =>
        props.isOpen ? "rotate(-90deg)" : "rotate(90deg)"};
    }
  }
`;

const StyledDropdownItem = styled(StyledRoomType)`
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.dropdownItem.background};

  &:hover {
    background-color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownItem.hoverBackground};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownItem.descriptionText};
  }

  .choose_room-forward_btn {
    display: none;
  }
`;

const StyledDisplayItem = styled(StyledRoomType)`
  cursor: default;
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.displayItem.background};
  border: 1px solid
    ${(props) =>
      props.theme.createEditRoomDialog.roomType.displayItem.borderColor};
  border-radius: 6px;

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.displayItem.descriptionText};
  }

  .choose_room-forward_btn {
    display: none;
  }
`;

const RoomType = ({
  t,
  roomType,
  onClick,
  type = "listItem",
  isOpen,
  id,
  selectedId,
  currentColorScheme,
}) => {
  const room = {
    type: roomType,
    title: getRoomTypeTitleTranslation(roomType, t),
    description: getRoomTypeDescriptionTranslation(roomType, t),
  };

  const accentColor = currentColorScheme?.main?.accent;

  const arrowClassName =
    type === "dropdownButton"
      ? "choose_room-forward_btn dropdown-button"
      : type === "dropdownItem"
        ? "choose_room-forward_btn dropdown-item"
        : "choose_room-forward_btn";

  const content = (
    <>
      <div className="choose_room-logo_wrapper">
        <RoomLogo type={room.type} />
      </div>

      <div className="choose_room-info_wrapper">
        <div className="choose_room-title">
          <Text noSelect className="choose_room-title-text">
            {t(room.title)}
          </Text>
        </div>
        <Text noSelect className="choose_room-description">
          {t(room.description)}
        </Text>
      </div>

      <IconButton
        className={arrowClassName}
        iconName={ArrowReactSvgUrl}
        size={16}
        onClick={() => {}}
      />
    </>
  );

  return type === "listItem" ? (
    <StyledListItem
      accentColor={accentColor}
      id={id}
      title={t(room.title)}
      onClick={onClick}
    >
      {content}
    </StyledListItem>
  ) : type === "dropdownButton" ? (
    <StyledDropdownButton
      id={id}
      title={t(room.title)}
      onClick={onClick}
      isOpen={isOpen}
      data-selected-id={selectedId}
      accentColor={accentColor}
    >
      {content}
    </StyledDropdownButton>
  ) : type === "dropdownItem" ? (
    <StyledDropdownItem
      id={id}
      title={t(room.title)}
      onClick={onClick}
      isOpen={isOpen}
      data-selected-id={selectedId}
      currentColorScheme={currentColorScheme}
    >
      {content}
    </StyledDropdownItem>
  ) : (
    <StyledDisplayItem
      id={id}
      title={t(room.title)}
      data-selected-id={selectedId}
      currentColorScheme={currentColorScheme}
    >
      {content}
    </StyledDisplayItem>
  );
};

StyledListItem.defaultProps = { theme: Base };
StyledDropdownButton.defaultProps = { theme: Base };
StyledDropdownItem.defaultProps = { theme: Base };
StyledDisplayItem.defaultProps = { theme: Base };

RoomType.propTypes = {
  room: PropTypes.object,
  onClick: PropTypes.func,
  type: PropTypes.oneOf([
    "displayItem",
    "listItem",
    "dropdownButton",
    "dropdownItem",
  ]),
  isOpen: PropTypes.bool,
  currentColorScheme: PropTypes.object,
};

export default inject(({ settingsStore }) => ({
  currentColorScheme: settingsStore.currentColorScheme,
}))(observer(RoomType));
