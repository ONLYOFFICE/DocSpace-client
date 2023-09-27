import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaPerItemComponent from "./QuotaPerItem";

const QuotaPerRoomComponent = (props) => {
  const { setRoomQuota } = props;
  const { t } = useTranslation("Settings");

  return (
    <QuotaPerItemComponent
      formLabel={t("QuotaPerRoom")}
      toggleLabel={t("DefineQuotaPerRoom")}
      disableQuota={() => setRoomQuota(-1, t)}
      saveQuota={(size) => setRoomQuota(size, t)}
    />
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { setRoomQuota } = currentQuotaStore;

  return { setRoomQuota };
})(observer(QuotaPerRoomComponent));
