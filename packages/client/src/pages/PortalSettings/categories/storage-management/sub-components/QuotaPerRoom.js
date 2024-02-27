import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaPerItemComponent from "./QuotaPerItem";

const QuotaPerRoomComponent = (props) => {
  const { setRoomQuota, defaultRoomsQuota, isDefaultRoomsQuotaSet } = props;
  const { t } = useTranslation("Settings");

  return (
    <QuotaPerItemComponent
      formLabel={t("QuotaPerRoom")}
      toggleLabel={t("DefineQuotaPerRoom")}
      disableQuota={() => setRoomQuota(-1, t)}
      saveQuota={(size) => setRoomQuota(size, t)}
      initialSize={defaultRoomsQuota}
      isQuotaSet={isDefaultRoomsQuotaSet}
    />
  );
};

export default inject(({ currentQuotaStore }) => {
  const { setRoomQuota, defaultRoomsQuota, isDefaultRoomsQuotaSet } =
    currentQuotaStore;

  return { setRoomQuota, defaultRoomsQuota, isDefaultRoomsQuotaSet };
})(observer(QuotaPerRoomComponent));
