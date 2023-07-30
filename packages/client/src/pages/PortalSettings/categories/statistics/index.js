import React from "react";

import QuotasComponent from "./sub-components/Quotas";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";

const StatisticsComponent = () => {
  return (
    <>
      <MainInfoComponent />
      <DiskSpaceUsedComponent />
      <QuotasComponent />
    </>
  );
};

export default StatisticsComponent;
