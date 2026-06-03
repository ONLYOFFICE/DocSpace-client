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

import RoomType from "@docspace/shared/components/room-type";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";

import styles from "./RoomTypeList.module.scss";

type RoomTypeListProps = {
  disabledFormRoom: boolean;
  isExternalShareRestricted?: boolean;

  setRoomType: (roomType: RoomsType) => void;
  setTemplateDialogIsVisible: (isVisible: boolean) => void;
};

const RoomTypeList = ({
  disabledFormRoom = true,
  isExternalShareRestricted,

  setRoomType,
  setTemplateDialogIsVisible,
}: RoomTypeListProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Files", "Common"]);

  const handleClick = (roomType: RoomsType | "template") => {
    if (disabledFormRoom && roomType === RoomsType.FormRoom) return;
    if (isExternalShareRestricted && roomType === RoomsType.PublicRoom) return;

    if (roomType === "template") {
      setTemplateDialogIsVisible(true);

      return;
    }

    setRoomType(roomType);
  };

  const formRoomTooltipContent = t("Files:FormRoomCreationLimit", {
    sectionName: t("Common:Rooms"),
  });

  const publicRoomTooltipContent = t("Common:PublicRoomCreationDisabled");

  return (
    <div className={styles.roomTypeList}>
      {RoomsTypeValues.map((roomType) => {
        const isFormRoom = roomType === RoomsType.FormRoom;
        const isPublicRoom = roomType === RoomsType.PublicRoom;

        const showFormRoomTooltip = isFormRoom && disabledFormRoom;
        const showPublicRoomTooltip = isPublicRoom && isExternalShareRestricted;
        const showTooltip = showFormRoomTooltip || showPublicRoomTooltip;

        const tooltipContent = showFormRoomTooltip
          ? formRoomTooltipContent
          : publicRoomTooltipContent;

        const roomTypeElement = (
          <RoomType
            id={roomType.toString()}
            key={roomType}
            roomType={roomType}
            type="listItem"
            onClick={() => handleClick(roomType)}
            disabledFormRoom={disabledFormRoom}
            disabledPublicRoom={isExternalShareRestricted}
            isOpen={false}
            selectedId={roomType.toString()}
          />
        );

        const tooltipId = `room-type-disabled-tooltip-${roomType}`;

        return showTooltip ? (
          <div key={roomType} id={tooltipId}>
            {roomTypeElement}
            <Tooltip
              id={`${tooltipId}-instance`}
              anchorSelect={`#${tooltipId}`}
              place="bottom"
              float
              getContent={() => tooltipContent as string}
            />
          </div>
        ) : (
          roomTypeElement
        );
      })}
      <RoomType
        id="Template"
        isTemplate
        type="listItem"
        onClick={() => handleClick("template")}
        disabledFormRoom={disabledFormRoom}
        isOpen={false}
        selectedId="Template"
      />
    </div>
  );
};

export default RoomTypeList;
