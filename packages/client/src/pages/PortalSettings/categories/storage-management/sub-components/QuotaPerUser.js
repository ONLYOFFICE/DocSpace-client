import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaPerItemComponent from "./QuotaPerItem";

const QuotaPerUserComponent = (props) => {
  const { setUserQuota } = props;

  const { t } = useTranslation("Settings");

  return (
    <QuotaPerItemComponent
      formLabel={t("QuotaPerUser")}
      toggleLabel={t("DefineQuotaPerUser")}
      disableQuota={() => setUserQuota(-1, t)}
      saveQuota={(size) => setUserQuota(size, t)}
    />
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { setUserQuota } = currentQuotaStore;

  return { setUserQuota };
})(observer(QuotaPerUserComponent));
