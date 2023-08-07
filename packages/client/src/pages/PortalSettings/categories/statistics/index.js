import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import QuotasComponent from "./sub-components/Quotas";
import StatisticsComponent from "./sub-components/Statistics";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./sub-components/MainInfo";

import Filter from "@docspace/common/api/people/filter";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import Divider from "./sub-components/Divider";
import { getPortal, getPortalUsersCount } from "@docspace/common/api/portal";
import { StyledBody } from "./StyledComponent";
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
      <Divider />
      <DiskSpaceUsedComponent />
      <Divider />
      <QuotasComponent />
      <Divider />
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
