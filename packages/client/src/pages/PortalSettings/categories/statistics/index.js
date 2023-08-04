import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import QuotasComponent from "./sub-components/Quotas";
import StatisticsComponent from "./sub-components/Statistics";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";
import Filter from "@docspace/common/api/people/filter";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import Divider from "./sub-components/Divider";

const FILTER_COUNT = 5;

const StorageManagement = ({ fetchRooms, getUsersList }) => {
  const [isLoading, setIsLoading] = useState(false);

  const init = async () => {
    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    setIsLoading(true);

    await Promise.all([
      getUsersList(userFilterData),
      fetchRooms(null, roomFilterData),
    ]);

    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (isLoading) return;

  return (
    <>
      <MainInfoComponent />

      <DiskSpaceUsedComponent />
      <Divider />
      <QuotasComponent />
      <Divider />
      <StatisticsComponent />
    </>
  );
};

export default inject(({ filesStore, peopleStore }) => {
  const { fetchRooms } = filesStore;
  const { usersStore } = peopleStore;
  const { getUsersList } = usersStore;
  return {
    fetchRooms,
    getUsersList,
  };
})(observer(StorageManagement));
