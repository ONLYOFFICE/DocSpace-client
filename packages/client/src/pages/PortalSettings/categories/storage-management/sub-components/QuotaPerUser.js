import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaPerItemComponent from "./QuotaPerItem";

const QuotaPerUserComponent = (props) => {
  const { setUserQuota, isDefaultUsersQuotaSet, defaultUsersQuota } = props;

  const { t } = useTranslation("Settings");

  return (
    <QuotaPerItemComponent
      formLabel={t("QuotaPerUser")}
      toggleLabel={t("DefineQuotaPerUser")}
      disableQuota={() => setUserQuota(-1, t)}
      saveQuota={(size) => setUserQuota(size, t)}
      initialSize={defaultUsersQuota}
      isQuotaSet={isDefaultUsersQuotaSet}
    />
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { setUserQuota, defaultUsersQuota, isDefaultUsersQuotaSet } =
    currentQuotaStore;

  return { setUserQuota, defaultUsersQuota, isDefaultUsersQuotaSet };
})(observer(QuotaPerUserComponent));
