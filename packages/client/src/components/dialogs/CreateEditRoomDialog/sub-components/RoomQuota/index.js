import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import QuotaForm from "SRC_DIR/components/QuotaForm";

const RoomQuota = (props) => {
  const { setRoomParams, roomParams, defaultRoomsQuota, isEdit, isLoading } =
    props;

  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const onSetQuotaBytesSize = (size) => {
    setRoomParams({ ...roomParams, quota: size });
  };
  return (
    <QuotaForm
      label={t("Common:StorageQuota")}
      description={t("StorageDescription")}
      checkboxLabel={t("DisableRoomQuota")}
      onSetQuotaBytesSize={onSetQuotaBytesSize}
      initialSize={isEdit ? roomParams.quota : defaultRoomsQuota}
      isDisabled={isLoading || roomParams.storageLocation.isThirdparty}
    />
  );
};

export default inject(({ currentQuotaStore }) => {
  const { defaultRoomsQuota } = currentQuotaStore;

  return { defaultRoomsQuota };
})(observer(RoomQuota));
