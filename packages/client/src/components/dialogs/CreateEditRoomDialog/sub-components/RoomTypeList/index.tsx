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

import RoomType from "@docspace/shared/components/room-type";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";

import styles from "./RoomTypeList.module.scss";

type RoomTypeListProps = {
  disabledFormRoom: boolean;

  setRoomType: (roomType: RoomsType) => void;
  setTemplateDialogIsVisible: (isVisible: boolean) => void;
};

const RoomTypeList = ({
  disabledFormRoom,

  setRoomType,
  setTemplateDialogIsVisible,
}: RoomTypeListProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Files", "Common"]);

  const handleClick = (roomType: RoomsType | "template") => {
    if (disabledFormRoom && roomType === RoomsType.FormRoom) return;

    if (roomType === "template") {
      setTemplateDialogIsVisible(true);

      return;
    }

    setRoomType(roomType);
  };

  const getTooltipContent = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("Files:FormRoomCreationLimit", {
          sectionName: t("Common:Rooms"),
        })}
      </Text>
    );
  };

  return (
    <div className={styles.roomTypeList}>
      <Tooltip
        place="bottom"
        id="create-room-tooltip"
        openOnClick={false}
        getContent={getTooltipContent}
      />

      {RoomsTypeValues.map((roomType) => (
        <RoomType
          id={roomType.toString()}
          key={roomType}
          roomType={roomType}
          type="listItem"
          onClick={() => handleClick(roomType)}
          disabledFormRoom={disabledFormRoom}
          isOpen={false}
          selectedId={roomType.toString()}
        />
      ))}
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
