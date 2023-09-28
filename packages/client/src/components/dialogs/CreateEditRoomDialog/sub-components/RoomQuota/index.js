import { useTranslation } from "react-i18next";

import QuotaForm from "SRC_DIR/components/QuotaForm";

const RoomQuota = (props) => {
  const { setRoomParams, roomParams } = props;
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const onSetQuotaBytesSize = (size) => {
    setRoomParams({ ...roomParams, quotaLimit: size });
  };

  return (
    <QuotaForm
      label={t("Common:StorageQuota")}
      description={t("StorageDescription")}
      checkboxLabel={t("DisableRoomQuota")}
      onSetQuotaBytesSize={onSetQuotaBytesSize}
    />
  );
};

export default RoomQuota;
