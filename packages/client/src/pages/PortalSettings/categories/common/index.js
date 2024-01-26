import React, { useEffect } from "react";
import { Submenu } from "@docspace/shared/components/submenu";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { inject, observer } from "mobx-react";
import Customization from "./customization";
import Branding from "./branding";
import Appearance from "./appearance";
import withLoading from "SRC_DIR/HOCs/withLoading";
import LoaderSubmenu from "./sub-components/loaderSubmenu";
import { resetSessionStorage } from "../../utils";
import { DeviceType } from "@docspace/shared/enums";

const SubmenuCommon = (props) => {
  const {
    t,

    tReady,
    setIsLoadedSubmenu,
    loadBaseInfo,
    isLoadedSubmenu,
    getWhiteLabelLogoUrls,
    currentDeviceType,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      resetSessionStorage();
      getWhiteLabelLogoUrls();
    };
  }, []);

  useEffect(() => {
    if (tReady) setIsLoadedSubmenu(true);
    if (isLoadedSubmenu) {
      load();
    }
  }, [tReady, isLoadedSubmenu]);

  const load = async () => {
    await loadBaseInfo();
  };

  const data = [
    {
      id: "general",
      name: t("Common:SettingsGeneral"),
      content: <Customization />,
    },
    {
      id: "branding",
      name: t("Branding"),
      content: <Branding />,
    },
    {
      id: "appearance",
      name: t("Appearance"),
      content: <Appearance />,
    },
  ];

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/customization/${e.id}`
      )
    );
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    return currentTab !== -1 ? currentTab : 0;
  };

  const currentTab = getCurrentTab();

  if (!isLoadedSubmenu) return <LoaderSubmenu />;

  return (
    <Submenu
      data={data}
      startSelect={currentTab}
      onSelect={(e) => onSelect(e)}
      topProps={
        currentDeviceType === DeviceType.desktop
          ? 0
          : currentDeviceType === DeviceType.mobile
            ? "53px"
            : "61px"
      }
    />
  );
};

export default inject(({ settingsStore, common }) => {
  const {
    isLoaded,
    setIsLoadedSubmenu,
    initSettings,
    isLoadedSubmenu,
    getWhiteLabelLogoUrls,
  } = common;

  const currentDeviceType = settingsStore.currentDeviceType;

  const isMobileView = currentDeviceType === DeviceType.mobile;
  return {
    loadBaseInfo: async () => {
      await initSettings(!isMobileView ? "general" : "");
    },
    isLoaded,
    setIsLoadedSubmenu,
    isLoadedSubmenu,
    getWhiteLabelLogoUrls,
    currentDeviceType,
  };
})(withLoading(withTranslation("Settings")(observer(SubmenuCommon))));
