import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { SettingsStorageManagementSkeleton } from "@docspace/shared/skeletons/settings";
import { setDocumentTitle } from "@docspace/client/src/helpers/filesUtils";

import QuotasComponent from "./Quotas";
import StatisticsComponent from "./Statistics";
import DiskSpaceUsedComponent from "./StorageSpaceUsed";
import MainInfoComponent from "./MainInfo";
import { StyledBody } from "./StyledComponent";
import StyledSettingsSeparator from "../../StyledSettingsSeparator";

const StorageManagement = ({
  isInit,
  language,
  init,
  clearIntervalCheckRecalculate,
}) => {
  useEffect(() => {
    moment.locale(language);
    init();

    return () => {
      clearIntervalCheckRecalculate();
    };
  }, []);

  const { t, ready } = useTranslation(["Settings", "Common"]);

  useEffect(() => {
    ready && setDocumentTitle(t("Settings:StorageManagement"));
  }, [ready]);

  if (!isInit || !ready) return <SettingsStorageManagementSkeleton />;

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
  const { init, isInit, clearIntervalCheckRecalculate } = storageManagement;
  return {
    isInit,
    language,
    init,
    clearIntervalCheckRecalculate,
  };
})(observer(StorageManagement));
