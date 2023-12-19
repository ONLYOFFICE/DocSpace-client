import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaForm from "SRC_DIR/components/QuotaForm";

const RoomQuota = (props) => {
  const { setRoomParams, roomParams, defaultRoomsQuota } = props;
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  useEffect(() => {
    setRoomParams({ ...roomParams, quota: defaultRoomsQuota });
  }, []);

  const onSetQuotaBytesSize = (size) => {
    setRoomParams({ ...roomParams, quota: size });
  };
  return (
    <QuotaForm
      label={t("Common:StorageQuota")}
      description={t("StorageDescription")}
      checkboxLabel={t("DisableRoomQuota")}
      onSetQuotaBytesSize={onSetQuotaBytesSize}
      initialSize={defaultRoomsQuota}
    />
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { defaultRoomsQuota } = currentQuotaStore;

  return { defaultRoomsQuota };
})(observer(RoomQuota));
