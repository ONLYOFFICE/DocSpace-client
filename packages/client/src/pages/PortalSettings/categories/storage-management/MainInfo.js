import { inject, observer } from "mobx-react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";

import { StyledMainInfo } from "./StyledComponent";

const MainInfoComponent = (props) => {
  const { portalInfo, activeUsersCount } = props;
  const { t } = useTranslation("Settings");

  const creationDate = moment(portalInfo.creationDateTime).format("L");

  return (
    <StyledMainInfo>
      <Text fontSize={"14px"} fontWeight={700}>
        {t("PortalCreatedDate", { date: creationDate })}
      </Text>
      <Text fontSize={"14px"} fontWeight={700}>
        {t("NumberOfActiveEmployees", { count: activeUsersCount })}
      </Text>
    </StyledMainInfo>
  );
};

export default inject(({ storageManagement }) => {
  const { portalInfo, activeUsersCount } = storageManagement;
  return {
    portalInfo,
    activeUsersCount,
  };
})(observer(MainInfoComponent));
