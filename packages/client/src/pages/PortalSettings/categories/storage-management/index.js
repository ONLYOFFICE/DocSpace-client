import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import Loaders from "@docspace/common/components/Loaders";

import QuotasComponent from "./Quotas";
import StatisticsComponent from "./Statistics";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";
import { StyledBody } from "./StyledComponent";
import StyledSettingsSeparator from "../../StyledSettingsSeparator";

const StorageManagement = ({ isInit, language, init }) => {
  useEffect(() => {
    moment.locale(language);
    init();
  }, []);

  if (!isInit) return <Loaders.SettingsStorageManagement />;

  return (
    <StyledBody>
      <MainInfoComponent />
      <StyledSettingsSeparator />
      <DiskSpaceUsedComponent />
      <StyledSettingsSeparator />
      <QuotasComponent />
      <StyledSettingsSeparator />
      <StatisticsComponent />
    </StyledBody>
  );
};

export default inject(({ authStore, storageManagement }) => {
  const { language } = authStore;
  const { init, isInit } = storageManagement;
  return {
    isInit,
    language,
    init,
  };
})(observer(StorageManagement));
