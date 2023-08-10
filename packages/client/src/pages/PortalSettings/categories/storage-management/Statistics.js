import React from "react";

import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";

import ItemIcon from "SRC_DIR/components/ItemIcon";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import { StyledStatistics } from "./StyledComponent";

import RoomsList from "./sub-components/RoomsList";
import UsersList from "./sub-components/UsersList";

const buttonProps = {
  className: "button-element",
  size: "small",
};
const StatisticsComponent = () => {
  const { t } = useTranslation("Settings");

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
    <SpaceQuota
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

  return (
    <StyledStatistics>
      <Text fontWeight={700} fontSize={"16px"} className="statistics_title">
        {t("Statistic")}
      </Text>
      <Text className="statistics-description">
        {t("StatisticDescription")}
      </Text>
      <RoomsList
        buttonProps={buttonProps}
        textElement={textElement}
        quotaElement={quotaElement}
        iconElement={iconElement}
      />
      <UsersList
        buttonProps={buttonProps}
        textElement={textElement}
        quotaElement={quotaElement}
        iconElement={iconElement}
      />
    </StyledStatistics>
  );
};

export default StatisticsComponent;
