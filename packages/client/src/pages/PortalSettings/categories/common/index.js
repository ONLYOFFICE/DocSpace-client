// (c) Copyright Ascensio System SIA 2009-2025
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
import { Tabs } from "@docspace/shared/components/tabs";
import { useLocation, useNavigate } from "react-router";
import { withTranslation } from "react-i18next";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { inject, observer } from "mobx-react";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { DeviceType } from "@docspace/shared/enums";
import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";
import Customization from "./customization";
import Branding from "./branding";
import Appearance from "./appearance";
import LoaderTabs from "./sub-components/loaderTabs";
import { resetSessionStorage } from "../../utils";

const TabsCommon = (props) => {
  const {
    t,
    tReady,
    setIsLoadedSubmenu,
    loadBaseInfo,
    isLoadedSubmenu,
    currentDeviceType,
    isMobileView,
    isCommunity,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const data = [
    {
      id: "general",
      name: t("Common:SettingsGeneral"),
      content: <Customization />,
    },
    {
      id: "appearance",
      name: t("Appearance"),
      content: <Appearance />,
    },
  ];

  if (!isCommunity) {
    data.splice(1, 0, {
      id: "branding",
      name: t("Common:Branding"),
      content: <Branding />,
    });
  }

  const getCurrentTabId = () => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const load = async () => {
    const currentTabId = getCurrentTabId();
    await loadBaseInfo(
      !isMobileView
        ? currentTabId === "general"
          ? "customization"
          : currentTabId === "branding"
            ? "branding"
            : "appearance"
        : "customization",
    );
  };

  useEffect(() => {
    return () => {
      resetSessionStorage();
    };
  }, []);

  useEffect(() => {
    if (tReady) setIsLoadedSubmenu(true);
    if (isLoadedSubmenu) {
      load();
    }
  }, [tReady, isLoadedSubmenu]);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/customization/${e.id}`,
      ),
    );
  };

  if (!isLoadedSubmenu) return <LoaderTabs />;

  return (
    <Tabs
      items={data}
      selectedItemId={getCurrentTabId()}
      onSelect={onSelect}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
    />
  );
};

export const Component = inject(
  ({ settingsStore, common, currentTariffStatusStore }) => {
    const { isLoaded, setIsLoadedSubmenu, initSettings, isLoadedSubmenu } =
      common;

    const { isCommunity } = currentTariffStatusStore;
    const currentDeviceType = settingsStore.currentDeviceType;

    const isMobileView = settingsStore.deviceType === DeviceType.mobile;
    return {
      loadBaseInfo: async (page) => {
        await initSettings(page);
      },
      isLoaded,
      setIsLoadedSubmenu,
      isLoadedSubmenu,
      currentDeviceType,
      isMobileView,
      isCommunity,
    };
  },
)(withLoading(withTranslation("Settings")(observer(TabsCommon))));
