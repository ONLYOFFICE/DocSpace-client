import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Submenu } from "@docspace/shared/components/submenu";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import AppLoader from "@docspace/common/components/AppLoader";
import { removeLocalStorage } from "../../utils";
import config from "../../../../../package.json";
import ManualBackup from "./backup/manual-backup";
import AutoBackup from "./backup/auto-backup";
import { DeviceType } from "@docspace/shared/enums";
import { isManagement } from "@docspace/shared/utils/common";

const DataManagementWrapper = (props) => {
  const {
    dataBackupUrl,
    automaticBackupUrl,
    buttonSize,
    t,

    isNotPaidPeriod,
    toDefault,
  } = props;

  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { interfaceDirection } = useTheme();
  const directionTooltip = interfaceDirection === "rtl" ? "left" : "right";
  useEffect(() => {
    return () => {
      removeLocalStorage("LocalCopyStorageType");
      toDefault();
    };
  }, []);

  const renderTooltip = (helpInfo, className) => {
    const isAutoBackupPage = window.location.pathname.includes(
      "portal-settings/backup/auto-backup"
    );
    return (
      <>
        <HelpButton
          size={12}
          offsetRight={5}
          place={directionTooltip}
          className={className}
          iconName={HelpReactSvgUrl}
          tooltipContent={
            <Text fontSize="12px">
              <Trans t={t} i18nKey={`${helpInfo}`} ns="Settings">
                {helpInfo}
              </Trans>
              <Box as={"span"} marginProp="10px 0 0">
                <Link
                  id="link-tooltip"
                  fontSize="13px"
                  href={isAutoBackupPage ? automaticBackupUrl : dataBackupUrl}
                  target="_blank"
                  isBold
                  isHovered
                >
                  {t("Common:LearnMore")}
                </Link>
              </Box>
            </Text>
          }
        />
      </>
    );
  };

  const data = [
    {
      id: "data-backup",
      name: t("DataBackup"),
      content: (
        <ManualBackup buttonSize={buttonSize} renderTooltip={renderTooltip} />
      ),
    },
    {
      id: "auto-backup",
      name: t("AutoBackup"),
      content: (
        <AutoBackup buttonSize={buttonSize} renderTooltip={renderTooltip} />
      ),
    },
  ];

  useEffect(() => {
    const path = location.pathname;

    const currentTab = data.findIndex((item) => path.includes(item.id));
    if (currentTab !== -1) setCurrentTab(currentTab);

    setIsLoading(true);
  }, []);

  const onSelect = (e) => {
    const url = isManagement()
      ? `/backup/${e.id}`
      : `/portal-settings/backup/${e.id}`;
    navigate(
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, url)
    );
  };

  if (!isLoading) return <AppLoader />;

  return isNotPaidPeriod ? (
    <ManualBackup buttonSize={buttonSize} renderTooltip={renderTooltip} />
  ) : (
    <Submenu
      data={data}
      startSelect={currentTab}
      onSelect={(e) => onSelect(e)}
    />
  );
};

export default inject(
  ({ settingsStore, setup, backup, currentTariffStatusStore }) => {
    const { initSettings } = setup;

    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { toDefault } = backup;
    const {
      dataBackupUrl,
      automaticBackupUrl,

      currentColorScheme,
      currentDeviceType,
    } = settingsStore;

    const buttonSize =
      currentDeviceType !== DeviceType.desktop ? "normal" : "small";
    return {
      loadBaseInfo: async () => {
        await initSettings();
      },
      dataBackupUrl,
      automaticBackupUrl,
      buttonSize,
      isNotPaidPeriod,
      currentColorScheme,
      toDefault,
    };
  }
)(withTranslation(["Settings", "Common"])(observer(DataManagementWrapper)));
