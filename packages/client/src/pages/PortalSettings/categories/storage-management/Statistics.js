import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";

import ItemIcon from "SRC_DIR/components/ItemIcon";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import { StyledStatistics, StyledMainTitle } from "./StyledComponent";

import RoomsList from "./sub-components/RoomsList";
import UsersList from "./sub-components/UsersList";

const buttonProps = {
  className: "button-element",
  size: "small",
};
const StatisticsComponent = (props) => {
  const { t } = useTranslation("Settings");
  const { isStatisticsAvailable } = props;
  const iconElement = (
    id,
    icon,
    fileExst,
    isRoom,
    defaultRoomIcon,
    className,
    title,
    color
  ) => (
    <div className={className}>
      <ItemIcon
        id={id}
        icon={icon}
        fileExst={fileExst}
        isRoom={isRoom}
        defaultRoomIcon={defaultRoomIcon}
        title={title}
        color={color}
      />
    </div>
  );
  const quotaElement = (item, type) => (
    <SpaceQuota isReadOnly item={item} type={type} />
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
      <div className="title-container">
        <StyledMainTitle fontWeight={700} fontSize={"16px"}>
          {t("Statistic")}
        </StyledMainTitle>
        {!isStatisticsAvailable && (
          <Badge
            backgroundColor="#EDC409"
            label={t("Common:Paid")}
            className="paid-badge"
            isPaidBadge
          />
        )}
      </div>
      <Text className="statistics-description">
        {t("StatisticDescription")}
      </Text>
      {isStatisticsAvailable && (
        <>
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
        </>
      )}
    </StyledStatistics>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(StatisticsComponent));
