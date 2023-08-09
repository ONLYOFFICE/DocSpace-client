import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import Filter from "@docspace/common/api/people/filter";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import { getPortal, getPortalUsersCount } from "@docspace/common/api/portal";

import QuotasComponent from "./Quotas";
import StatisticsComponent from "./Statistics";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";
import { StyledBody } from "./StyledComponent";
import StyledSettingsSeparator from "../../StyledSettingsSeparator";

const FILTER_COUNT = 5;
let portalInfo, activeUsersCount;
const StorageManagement = ({ fetchRooms, getUsersList, language }) => {
  const [isLoading, setIsLoading] = useState(true);

  const init = async () => {
    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    setIsLoading(true);

    [, , portalInfo, activeUsersCount] = await Promise.all([
      getUsersList(userFilterData),
      fetchRooms(null, roomFilterData),
      getPortal(),
      getPortalUsersCount(),
    ]);

    setIsLoading(false);
  };

  useEffect(() => {
    moment.locale(language);
    init();
  }, []);

  if (isLoading) return;

  return (
    <StyledBody>
      <MainInfoComponent
        portalInfo={portalInfo}
        activeUsersCount={activeUsersCount}
      />
      <StyledSettingsSeparator />
      <DiskSpaceUsedComponent />
      <StyledSettingsSeparator />
      <QuotasComponent />
      <StyledSettingsSeparator />
      <StatisticsComponent />
    </StyledBody>
  );
};

export default inject(({ auth, filesStore, peopleStore }) => {
  const { fetchRooms } = filesStore;
  const { usersStore } = peopleStore;
  const { getUsersList } = usersStore;

  const { language } = auth;

  return {
    fetchRooms,
    getUsersList,
    language,
  };
})(observer(StorageManagement));
