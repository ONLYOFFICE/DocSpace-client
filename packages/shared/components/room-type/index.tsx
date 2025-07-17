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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import { RoomsType } from "../../enums";

import { RoomLogo } from "../room-logo";
import { IconButton } from "../icon-button";
import { Text } from "../text";
import { Badge } from "../badge";

import {
  getRoomTypeDescriptionTranslation,
  getRoomTypeTitleTranslation,
} from "./RoomType.utils";
import styles from "./RoomType.module.scss";
import { RoomTypeProps } from "./RoomType.types";
import { globalColors } from "../../themes";

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
          {isTemplate ? (
            <Badge
              label={t("Common:New")}
              backgroundColor={globalColors.lightBlueMain}
              fontSize="9px"
              fontWeight={700}
              borderRadius="50px"
              noHover
              isHovered={false}
            />
          ) : null}
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
    <div
      className={classNames(styles.roomType, styles.listItem, {
        [styles.isOpen]: isOpen,
      })}
      id={id}
      title={disabled ? "" : t(room.title)}
      onClick={onClick}
      data-tooltip-id={disabled ? "create-room-tooltip" : ""}
      data-testid="room-type-list-item"
      data-selected-id={selectedId}
    >
      {content}
    </div>
  ) : type === "dropdownButton" ? (
    <div
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
    </div>
  ) : type === "dropdownItem" ? (
    <div
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
    </div>
  ) : (
    <div
      id={id}
      title={t(room.title)}
      data-selected-id={selectedId}
      className={classNames(styles.roomType, styles.displayItem, {
        [styles.isOpen]: isOpen,
      })}
    >
      {content}
    </div>
  );
};

export default RoomType;
