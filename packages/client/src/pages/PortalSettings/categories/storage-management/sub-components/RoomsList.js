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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import RoomsFilter from "@docspace/shared/api/rooms/filter";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const RoomsListComponent = (props) => {
  const {
    rooms,
    iconElement,
    textElement,
    quotaElement,
    buttonProps,
    id,
    roomsListLength,
    roomFilterData,
  } = props;
  const { t } = useTranslation("Settings");

  const navigate = useNavigate();

  const onClickRooms = () => {
    const defaultFilter = RoomsFilter.getDefault();
    roomFilterData.pageCount = defaultFilter.pageCount;

    const urlFilter = roomFilterData.toUrlParams();

    navigate(`/rooms/shared/filter?${urlFilter}`);
  };

  const roomsList = rooms.map((item, index) => {
    const { id, icon, fileExst, defaultRoomIcon, isRoom, title, logo } = item;
    const color = logo?.color;

    if (index === 5) return;

    return (
      <StyledSimpleFilesRow key={item.id}>
        {iconElement(
          id,
          icon,
          fileExst,
          isRoom,
          defaultRoomIcon,
          null,
          title,
          color,
          logo,
        )}
        {textElement(title)}
        {quotaElement(item)}
      </StyledSimpleFilesRow>
    );
  });

  if (roomsListLength === 0) return <></>;

  return (
    <StyledStatistics>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {t("Top5rooms")}
        </Text>
        {roomsList}

        {roomsListLength > 5 && (
          <Button
            {...buttonProps}
            label={t("Common:ShowMore")}
            onClick={onClickRooms}
          />
        )}
      </div>
    </StyledStatistics>
  );
};

export default inject(({ userStore, storageManagement }) => {
  const { user } = userStore;
  const { rooms, roomFilterData } = storageManagement;
  const roomsListLength = rooms.length;

  return {
    id: user?.id,
    roomsListLength,
    rooms,
    roomFilterData,
  };
})(observer(RoomsListComponent));
