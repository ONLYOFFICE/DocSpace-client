import React from "react";

import Row from "@docspace/components/row";
import Text from "@docspace/components/text";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import ItemIcon from "SRC_DIR/components/ItemIcon";
import UsedSpace from "SRC_DIR/components/UsedSpace";
import { StyledStatistics } from "../StyledComponent";

const StyledSimpleFilesRow = styled(Row)`
  .row_content {
    gap: 12px;
    align-items: center;
    height: 56px;
    .row_name {
      width: 100%;
      overflow: hidden;

      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

const StatisticsComponent = (props) => {
  const { filesList, peopleList } = props;

  const iconElement = (id, icon, fileExst, isRoom, defaultRoomIcon) => (
    <ItemIcon
      id={id}
      icon={icon}
      fileExst={fileExst}
      isRoom={isRoom}
      defaultRoomIcon={defaultRoomIcon}
    />
  );
  const quotaElement = (usedSpace, quotaLimit) => (
    <UsedSpace
      isDisabledQuotaChange
      usedQuota={usedSpace}
      quotaLimit={quotaLimit}
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
          <div className="row_name">
            <Text fontSize={"12px"} fontWeight={600}>
              {title}
            </Text>
          </div>
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
          {iconElement(id, avatar, fileExst, isRoom, defaultRoomIcon)}
          <div className="row_name">
            <Text fontSize={"12px"} fontWeight={600}>
              {displayName}
            </Text>
          </div>
          {quotaElement(usedSpace, quotaLimit)}
        </>
      </StyledSimpleFilesRow>
    );
  });

  return (
    <StyledStatistics>
      <Text fontWeight={700} fontSize={"16px"} className="statistics_title">
        {"Statistic"}
      </Text>
      <Text className="statistics-description">
        {"Here, you can view the detailed storage usage data in this DocSpace."}
      </Text>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {"Top 5 rooms by storage usage:"}
        </Text>
        {roomsList}
      </div>
      <div>
        <Text fontWeight={600} className="item-statistic">
          {"Top 5 users by storage usage:"}
        </Text>
        {usersList}
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
