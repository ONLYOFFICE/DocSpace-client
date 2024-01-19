import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import RoomsFilter from "@docspace/shared/api/rooms/filter";

import { SortByFieldName } from "SRC_DIR/helpers/constants";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const RoomsListComponent = (props) => {
  const {
    filesList,
    iconElement,
    textElement,
    quotaElement,
    buttonProps,
    id,
    filesListLength,
  } = props;
  const { t } = useTranslation("Settings");

  const navigate = useNavigate();

  const onClickRooms = () => {
    const newFilter = RoomsFilter.getDefault();
    newFilter.sortBy = SortByFieldName.UsedSpace;
    const urlFilter = newFilter.toUrlParams();

    localStorage.removeItem(`UserRoomsFilter=${id}`);

    navigate(`/rooms/shared/filter?${urlFilter}`);
  };

  const roomsList = filesList.map((item, index) => {
    const { id, icon, fileExst, defaultRoomIcon, isRoom, title, logo } = item;
    const color = logo?.color;

    if (index === 5) return;

    return (
      <StyledSimpleFilesRow key={item.id}>
        <>
          {iconElement(
            id,
            icon,
            fileExst,
            isRoom,
            defaultRoomIcon,
            null,
            title,
            color
          )}
          {textElement(title)}
          {quotaElement(item)}
        </>
      </StyledSimpleFilesRow>
    );
  });

  if (filesListLength === 0) return <></>;

  return (
    <StyledStatistics>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {t("Top5rooms")}
        </Text>
        {roomsList}

        {filesListLength > 5 && (
          <Button
            {...buttonProps}
            label={t("ShowMore")}
            onClick={onClickRooms}
          />
        )}
      </div>
    </StyledStatistics>
  );
};

export default inject(({ auth, filesStore }) => {
  const { userStore } = auth;
  const { user } = userStore;
  const { filesList } = filesStore;

  const filesListLength = filesList.length;

  return {
    filesList,
    id: user?.id,
    filesListLength,
  };
})(observer(RoomsListComponent));
