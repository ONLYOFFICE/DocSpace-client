import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import Filter from "@docspace/common/api/people/filter";

import ItemIcon from "SRC_DIR/components/ItemIcon";
import UsedSpace from "SRC_DIR/components/UsedSpace";
import { SortByFieldName } from "SRC_DIR/helpers/constants";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";
import Button from "@docspace/components/button";

const StatisticsComponent = (props) => {
  const { filesList, peopleList } = props;
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const iconElement = (
    id,
    icon,
    fileExst,
    isRoom,
    defaultRoomIcon,
    className
  ) => (
    <div className={className}>
      <ItemIcon
        id={id}
        icon={icon}
        fileExst={fileExst}
        isRoom={isRoom}
        defaultRoomIcon={defaultRoomIcon}
      />
    </div>
  );
  const quotaElement = (usedSpace, quotaLimit) => (
    <UsedSpace
      isDisabledQuotaChange
      usedQuota={usedSpace}
      quotaLimit={quotaLimit}
    />
  );
  const textElement = (title) => (
    <div className="row_name">
      <Text fontSize={"12px"} fontWeight={600}>
        {title}
      </Text>
    </div>
  );

  const onClickUsers = () => {
    const newFilter = Filter.getDefault();
    newFilter.sortBy = SortByFieldName.Name;
    const urlFilter = newFilter.toUrlParams();

    navigate(`/accounts/filter?${urlFilter}`);
  };
  const onClickRooms = () => {
    const newFilter = RoomsFilter.getDefault();
    newFilter.sortBy = SortByFieldName.RoomType;
    const urlFilter = newFilter.toUrlParams();

    navigate(`/rooms/shared/filter?${urlFilter}`);
  };
  const buttonElement = (isRooms) => (
    <Button
      className="button-element"
      label={t("ShowMore")}
      size="small"
      onClick={isRooms ? onClickRooms : onClickUsers}
    />
  );

  const roomsList = filesList.map((item) => {
    const {
      id,
      icon,
      fileExst,
      defaultRoomIcon,
      isRoom,
      title,
      usedSpace,
      quotaLimit,
    } = item;
    return (
      <StyledSimpleFilesRow key={item.id}>
        <>
          {iconElement(id, icon, fileExst, isRoom, defaultRoomIcon)}
          {textElement(title)}
          {quotaElement(usedSpace, quotaLimit)}
        </>
      </StyledSimpleFilesRow>
    );
  });

  const usersList = peopleList.map((item) => {
    const {
      fileExst,
      avatar,
      id,
      displayName,
      usedSpace,
      quotaLimit,
      isRoom,
      defaultRoomIcon,
    } = item;

    return (
      <StyledSimpleFilesRow key={id}>
        <>
          {iconElement(
            id,
            avatar,
            fileExst,
            isRoom,
            defaultRoomIcon,
            "user-icon"
          )}
          {textElement(displayName)}
          {quotaElement(usedSpace, quotaLimit)}
        </>
      </StyledSimpleFilesRow>
    );
  });

  return (
    <StyledStatistics>
      <Text fontWeight={700} fontSize={"16px"} className="statistics_title">
        {t("Statistic")}
      </Text>
      <Text className="statistics-description">
        {t("StatisticDescription")}
      </Text>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {t("Top5rooms")}
        </Text>
        {roomsList}
        {buttonElement(true)}
      </div>
      <div>
        <Text fontWeight={600} className="item-statistic">
          {t("Top5Users")}
        </Text>
        {usersList}
        {buttonElement()}
      </div>
    </StyledStatistics>
  );
};

export default inject(({ filesStore, peopleStore }) => {
  const { filesList } = filesStore;
  const { usersStore } = peopleStore;
  const { peopleList } = usersStore;

  return {
    filesList,
    peopleList,
  };
})(observer(StatisticsComponent));
