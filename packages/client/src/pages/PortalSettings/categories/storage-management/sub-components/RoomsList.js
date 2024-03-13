import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

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
