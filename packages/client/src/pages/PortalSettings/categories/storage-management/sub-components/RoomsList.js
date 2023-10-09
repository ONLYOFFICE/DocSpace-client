import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import RoomsFilter from "@docspace/common/api/rooms/filter";

import { SortByFieldName } from "SRC_DIR/helpers/constants";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const RoomsListComponent = (props) => {
  const { filesList, iconElement, textElement, quotaElement, buttonProps } =
    props;
  const { t } = useTranslation("Settings");

  const navigate = useNavigate();

  const onClickRooms = () => {
    const newFilter = RoomsFilter.getDefault();
    newFilter.sortBy = SortByFieldName.UsedSpace;
    const urlFilter = newFilter.toUrlParams();

    navigate(`/rooms/shared/filter?${urlFilter}`);
  };

  const roomsList = filesList.map((item) => {
    const { id, icon, fileExst, defaultRoomIcon, isRoom, title, logo } = item;
    const color = logo?.color;

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

  return (
    <StyledStatistics>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {t("Top5rooms")}
        </Text>
        {roomsList}

        <Button {...buttonProps} label={t("ShowMore")} onClick={onClickRooms} />
      </div>
    </StyledStatistics>
  );
};

export default inject(({ filesStore }) => {
  const { filesList } = filesStore;

  return {
    filesList,
  };
})(observer(RoomsListComponent));
