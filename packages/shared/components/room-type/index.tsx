/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { KeyboardEventHandler, MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";
import PrivateRoomLogoUrl from "PUBLIC_DIR/images/icons/32/room/private.svg?url";
import TemplateGalleryLogoUrl from "PUBLIC_DIR/images/icons/32/room/template-gallery.svg?url";

import { RoomsType, RoomsTypePrivate } from "../../enums";

import { RoomLogo } from "@onlyoffice/apps-ui-kit/components/room-logo";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { TooltipContainer } from "@onlyoffice/apps-ui-kit/components/tooltip";
import { consumeKey } from "@onlyoffice/apps-ui-kit/utils/consume-key";

import {
  getRoomTypeDescriptionTranslation,
  getRoomTypeTitleTranslation,
} from "./RoomType.utils";
import styles from "./RoomType.module.scss";
import { RoomTypeProps } from "./RoomType.types";

const RoomType = ({
  roomType,
  onClick,
  type = "listItem",
  isOpen,
  id,
  selectedId,
  disabledFormRoom,
  disabledPublicRoom,
  isTemplate,
  isTemplateRoom,
  isFormSection,
  isTemplateGallery,
}: RoomTypeProps) => {
  const { t } = useTranslation(["Common"]);

  const room = {
    type: roomType,
    title: isTemplateGallery
      ? t("Common:FromTemplateGallery")
      : getRoomTypeTitleTranslation(t, roomType, isTemplate, isFormSection),
    description: isTemplateGallery
      ? t("Common:FromTemplateGalleryDescription")
      : getRoomTypeDescriptionTranslation(
          t,
          roomType,
          isTemplate,
          isFormSection,
        ),
  };

  const isFormRoom = roomType === RoomsType.FormRoom;
  const isPrivateRoom =
    roomType === RoomsTypePrivate && !isTemplate && !isTemplateRoom;
  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const disabled =
    (isFormRoom && disabledFormRoom) ||
    (isPublicRoomType && disabledPublicRoom);

  // `listItem` and `dropdownItem` render the disabled state, so they also
  // refuse the click. Styling alone left the handler live.
  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (disabled) return;
    onClick?.(e);
  };

  // The interactive layouts are buttons: Enter and Space click them, so the
  // handler still receives the mouse event it is typed for. The key's keyup
  // is consumed too: the click moves focus on (choosing a type focuses the
  // room name, whose Enter keyup creates the room), and the same press must
  // not act there as well.
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    // A disabled type does nothing, so it must not take the next keyup either.
    if (disabled) return;
    consumeKey(e);
    e.currentTarget.click();
  };

  const buttonProps = {
    role: "button",
    tabIndex: 0,
    onKeyDown: handleKeyDown,
  } as const;

  const arrowClassName =
    type === "dropdownButton"
      ? "choose_room-forward_btn dropdown-button"
      : type === "dropdownItem"
        ? "choose_room-forward_btn dropdown-item"
        : "choose_room-forward_btn";

  const content = (
    <>
      <div className="choose_room-logo_wrapper">
        {isTemplateGallery ? (
          <ReactSVG
            className="choose_room-private-logo"
            src={TemplateGalleryLogoUrl}
          />
        ) : isPrivateRoom ? (
          <ReactSVG
            className="choose_room-private-logo"
            src={PrivateRoomLogoUrl}
          />
        ) : (
          <RoomLogo
            type={room.type}
            isTemplate={isTemplate}
            isTemplateRoom={isTemplateRoom}
          />
        )}
      </div>

      <div className="choose_room-info_wrapper">
        <div className="choose_room-title">
          <Text className="choose_room-title-text">{room.title}</Text>
        </div>
        <Text className="choose_room-description">{room.description}</Text>
      </div>

      <IconButton
        className={arrowClassName}
        iconName={ArrowReactSvgUrl}
        size={16}
        // No onClick: the arrow sits inside the root, which already handles
        // the click. Passing the handler here too made one click call it
        // twice. isClickable keeps the pointer cursor the handler used to set.
        isClickable={!disabled}
      />
    </>
  );

  return type === "listItem" ? (
    <TooltipContainer
      as="div"
      className={classNames(styles.roomType, styles.listItem, {
        [styles.isOpen]: isOpen,
        [styles.disabled]: disabled,
      })}
      id={id}
      title={disabled ? "" : room.title}
      onClick={handleClick}
      {...buttonProps}
      aria-disabled={disabled || undefined}
      data-tooltip-id={disabled ? "create-room-tooltip" : undefined}
      data-testid="room-type-list-item"
      data-selected-id={selectedId}
    >
      {content}
    </TooltipContainer>
  ) : type === "dropdownButton" ? (
    <TooltipContainer
      as="div"
      id={id}
      title={room.title}
      onClick={onClick}
      {...buttonProps}
      aria-expanded={isOpen}
      className={classNames(styles.roomType, styles.dropDownButton, {
        [styles.isOpen]: isOpen,
      })}
      data-selected-id={selectedId}
      data-testid="room-type-dropdown-button"
    >
      {content}
    </TooltipContainer>
  ) : type === "dropdownItem" ? (
    <TooltipContainer
      as="div"
      id={id}
      title={disabled ? "" : room.title}
      onClick={handleClick}
      {...buttonProps}
      aria-disabled={disabled || undefined}
      data-selected-id={selectedId}
      className={classNames(styles.roomType, styles.dropDownItem, {
        [styles.isOpen]: isOpen,
      })}
      data-testid="room-type-dropdown-item"
    >
      {content}
    </TooltipContainer>
  ) : (
    <TooltipContainer
      as="div"
      id={id}
      title={room.title}
      data-selected-id={selectedId}
      className={classNames(styles.roomType, styles.displayItem, {
        [styles.isOpen]: isOpen,
      })}
    >
      {content}
    </TooltipContainer>
  );
};

export default RoomType;

