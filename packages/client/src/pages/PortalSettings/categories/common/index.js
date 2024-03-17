// (c) Copyright Ascensio System SIA 2010-2024
// 
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
// 
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
// 
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
// 
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
// 
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
// 
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
    isMobileView,
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
    const currentTab = getCurrentTab();
    await loadBaseInfo(
      !isMobileView ? (currentTab === 0 ? "general" : "branding") : ""
    );
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
    loadBaseInfo: async (page) => {
      await initSettings(page);
    },
    isLoaded,
    setIsLoadedSubmenu,
    isLoadedSubmenu,
    getWhiteLabelLogoUrls,
    currentDeviceType,
    isMobileView,
  };
})(withLoading(withTranslation("Settings")(observer(SubmenuCommon))));
