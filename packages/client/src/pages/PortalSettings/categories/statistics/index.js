import React from "react";

import BaseQuotaComponent from "./BaseQuota";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";

const StatisticsComponent = () => {
  return (
    <>
      <MainInfoComponent />
      <BaseQuotaComponent />
      <DiskSpaceUsedComponent />
    </>
  );
};

export default StatisticsComponent;
