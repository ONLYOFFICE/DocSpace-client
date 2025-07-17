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

import React from "react";
import classNames from "classnames";

import { isMobile } from "react-device-detect";

import ArchiveSvg32Url from "PUBLIC_DIR/images/icons/32/room/archive.svg?url";
import CustomSvg32Url from "PUBLIC_DIR/images/icons/32/room/custom.svg?url";
import EditingSvg32Url from "PUBLIC_DIR/images/icons/32/room/editing.svg?url";
import PublicRoomSvg32Url from "PUBLIC_DIR/images/icons/32/room/public.svg?url";
import FormRoomSvg32Url from "PUBLIC_DIR/images/icons/32/room/form.svg?url";
import VirtualDataRoomRoomSvg32Url from "PUBLIC_DIR/images/icons/32/room/virtual-data.svg?url";
import TemplateRoomsSvg32Url from "PUBLIC_DIR/images/icons/32/room/template.svg?url";

import CollaborationTemplateSvg32Url from "PUBLIC_DIR/images/icons/32/template/collaboration.svg?url";
import CustomTemplateSvg32Url from "PUBLIC_DIR/images/icons/32/template/custom.svg?url";
import FormTemplateSvg32Url from "PUBLIC_DIR/images/icons/32/template/form.svg?url";
import PublicTemplateSvg32Url from "PUBLIC_DIR/images/icons/32/template/public.svg?url";
import VirtualDataTemplateSvg32Url from "PUBLIC_DIR/images/icons/32/template/virtual-data.svg?url";

import { RoomsType } from "../../enums";

import { Checkbox } from "../checkbox";

import { RoomLogoProps } from "./RoomLogo.types";
import styles from "./RoomLogo.module.scss";

const RoomLogoPure = ({
  id,
  className,
  style,
  type,

  isArchive = false,
  isTemplate = false,
  withCheckbox = false,
  isChecked = false,
  isIndeterminate = false,
  isTemplateRoom = false,
  onChange,
}: RoomLogoProps) => {
  const getIcon = () => {
    if (isArchive) {
      return ArchiveSvg32Url;
    }

    if (isTemplate) {
      return TemplateRoomsSvg32Url;
    }

    if (isTemplateRoom) {
      switch (type) {
        case RoomsType.EditingRoom:
          return CollaborationTemplateSvg32Url;
        case RoomsType.CustomRoom:
          return CustomTemplateSvg32Url;
        case RoomsType.PublicRoom:
          return PublicTemplateSvg32Url;
        case RoomsType.VirtualDataRoom:
          return VirtualDataTemplateSvg32Url;
        case RoomsType.FormRoom:
          return FormTemplateSvg32Url;

        default:
          return "";
      }
    }

    switch (type) {
      case RoomsType.EditingRoom:
        return EditingSvg32Url;
      case RoomsType.CustomRoom:
        return CustomSvg32Url;
      case RoomsType.PublicRoom:
        return PublicRoomSvg32Url;
      case RoomsType.VirtualDataRoom:
        return VirtualDataRoomRoomSvg32Url;
      case RoomsType.FormRoom:
        return FormRoomSvg32Url;

      default:
        return "";
    }
  };

  const onSelect = () => {
    if (!isMobile) return;

    onChange?.();
  };

  const icon = getIcon();

  return (
    <div
      id={id}
      className={classNames(className, styles.container)}
      style={style}
      data-testid="room-logo"
    >
      <div
        className={classNames("room-logo_icon-container", styles.container)}
        onClick={onSelect}
      >
        <img className="room-logo_icon" alt="room-logo" src={icon} />
      </div>

      {withCheckbox ? (
        <Checkbox
          className="room-logo_checkbox checkbox"
          isChecked={isChecked}
          isIndeterminate={isIndeterminate}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
};

export { RoomLogoPure };

const RoomLogo = React.memo(RoomLogoPure);

export { RoomLogo };
