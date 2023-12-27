import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { combineUrl } from "@docspace/common/utils";
import { DeviceType } from "@docspace/common/constants";
import ManualBackup from "./manual-backup";
import AutoBackup from "./auto-backup";
import { Submenu } from "@docspace/shared/components";
import config from "PACKAGE_FILE";

const Backup = ({ t, buttonSize, isNotPaidPeriod }) => {
  const navigate = useNavigate();

  const data = [
    {
      id: "data-backup",
      name: t("DataBackup"),
      content: <ManualBackup buttonSize={buttonSize} />,
    },
    {
      id: "auto-backup",
      name: t("AutoBackup"),
      content: <AutoBackup buttonSize={buttonSize} />,
    },
  ];

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/backup/${e.id}`
      )
    );
  };

  return isNotPaidPeriod ? (
    <ManualBackup buttonSize={buttonSize} />
  ) : (
    <Submenu data={data} startSelect={data[0]} onSelect={(e) => onSelect(e)} />
  );
};

export default inject(({ auth }) => {
  const { settingsStore, currentTariffStatusStore } = auth;
  const { isNotPaidPeriod } = currentTariffStatusStore;
  const { currentDeviceType, currentColorScheme } = settingsStore;

  const buttonSize =
    currentDeviceType === DeviceType.desktop ? "small" : "normal";

  return {
    buttonSize,
    isNotPaidPeriod,
    currentColorScheme,
    toDefault,
  };
})(observer(withTranslation(["Settings", "Common"])(Backup)));
