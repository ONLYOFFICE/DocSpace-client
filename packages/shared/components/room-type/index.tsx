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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import { RoomsType } from "../../enums";

import { RoomLogo } from "@docspace/ui-kit/components/room-logo";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

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
  isTemplate,
  isTemplateRoom,
}: RoomTypeProps) => {
  const { t } = useTranslation(["Common"]);

  const room = {
    type: roomType,
    title: getRoomTypeTitleTranslation(t, roomType, isTemplate),
    description: getRoomTypeDescriptionTranslation(t, roomType, isTemplate),
  };

  const isFormRoom = roomType === RoomsType.FormRoom;

  const disabled = isFormRoom && disabledFormRoom;

  const arrowClassName =
    type === "dropdownButton"
      ? "choose_room-forward_btn dropdown-button"
      : type === "dropdownItem"
        ? "choose_room-forward_btn dropdown-item"
        : "choose_room-forward_btn";

  const content = (
    <>
      <div className="choose_room-logo_wrapper">
        <RoomLogo
          type={room.type}
          isTemplate={isTemplate}
          isTemplateRoom={isTemplateRoom}
        />
      </div>

      <div className="choose_room-info_wrapper">
        <div className="choose_room-title">
          <Text className="choose_room-title-text">{t(room.title)}</Text>
        </div>
        <Text className="choose_room-description">{t(room.description)}</Text>
      </div>

      <IconButton
        className={arrowClassName}
        iconName={ArrowReactSvgUrl}
        size={16}
        onClick={onClick}
      />
    </>
  );

  return type === "listItem" ? (
    <TooltipContainer
      as="div"
      className={classNames(styles.roomType, styles.listItem, {
        [styles.isOpen]: isOpen,
      })}
      id={id}
      title={disabled ? "" : t(room.title)}
      onClick={onClick}
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
      title={t(room.title)}
      onClick={onClick}
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
      title={t(room.title)}
      onClick={onClick}
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
      title={t(room.title)}
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
