/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { withTranslation } from "react-i18next";

import { Tabs } from "@docspace/ui-kit/components/tabs";
import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";
import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TTranslation } from "@docspace/shared/types";

import config from "PACKAGE_FILE";
import withLoading from "SRC_DIR/HOCs/withLoading";
import BrandingStore from "SRC_DIR/store/portal-settings/BrandingStore";
import CommonStore from "SRC_DIR/store/CommonStore";
import DefaultTemplatesStore from "SRC_DIR/store/portal-settings/DefaultTemplatesStore";

import Customization from "./customization";
import Branding from "./branding";
import Appearance from "./appearance";
import DefaultTemplates from "./DefaultTemplates";

import LoaderTabs from "./sub-components/loaderTabs";
import useCommon from "./useCommon";
import { resetSessionStorage } from "../../utils";
import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

type TabsCommonProps = {
  t: TTranslation;
  tReady: boolean;
  setIsLoadedSubmenu: (value: boolean) => void;
  loadBaseInfo: (page: string) => Promise<void>;
  isLoadedSubmenu: boolean;
  currentDeviceType: DeviceType;
  isMobileView: boolean;
  isCommunity: boolean;
  brandingStore: BrandingStore;
  settingsStore: SettingsStore;
  common: CommonStore;
  defaultTemplatesStore: DefaultTemplatesStore;
  clearAbortControllerArr: SettingsStore["clearAbortControllerArr"];
};

const TabsCommon = (props: TabsCommonProps) => {
  const {
    t,
    tReady,
    setIsLoadedSubmenu,
    loadBaseInfo,
    isLoadedSubmenu,
    currentDeviceType,
    isMobileView,
    isCommunity,
    brandingStore,
    settingsStore,
    common,
    defaultTemplatesStore,
    clearAbortControllerArr,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTabId, setCurrentTabId] = useState<string>("");

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    brandingStore,
    common,
    defaultTemplatesStore,
  });

  const { getCustomizationData, getBrandingData, getTemplatesData } = useCommon(
    defaultProps.common,
  );

  const data = [
    {
      id: "general",
      name: t("Common:SettingsGeneral"),
      content: <Customization />,
      onClick: async () => {
        clearAbortControllerArr();
        await getCustomizationData();
      },
    },
    {
      id: "appearance",
      name: t("Appearance"),
      content: <Appearance />,
      onClick: () => {},
    },
    {
      id: "default-templates",
      name: t("DefaultTemplates"),
      content: <DefaultTemplates />,
      onClick: async () => {
        clearAbortControllerArr();
        await getTemplatesData();
      },
    },
  ];

  if (!isCommunity) {
    data.splice(1, 0, {
      id: "branding",
      name: t("Common:Branding"),
      content: <Branding />,
      onClick: async () => {
        clearAbortControllerArr();
        await getBrandingData();
      },
    });
  }

  useEffect(() => {
    return () => {
      resetSessionStorage();
    };
  }, []);

  useEffect(() => {
    if (tReady) setIsLoadedSubmenu(true);
    if (isLoadedSubmenu) {
      const path = location.pathname;
      const currentTab = data.find((item) => path.includes(item.id));
      if (currentTab && data.length) setCurrentTabId(currentTab.id);
    }
  }, [tReady, isLoadedSubmenu]);

  const onSelect = (e: { id: string }) => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/customization/${e.id}`,
      ),
    );
    setCurrentTabId(e.id);
  };

  if (!isLoadedSubmenu) return <LoaderTabs />;

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
      withAnimation
    />
  );
};

export const Component = inject(
  ({
    settingsStore,
    common,
    currentTariffStatusStore,
    brandingStore,
    defaultTemplatesStore,
  }: TStore) => {
    const { setIsLoadedSubmenu, initSettings, isLoadedSubmenu } = common;
    const { clearAbortControllerArr } = settingsStore;

    const { isCommunity } = currentTariffStatusStore;
    const currentDeviceType = settingsStore.currentDeviceType as DeviceType;

    const isMobileView = settingsStore.deviceType === DeviceType.mobile;
    return {
      loadBaseInfo: async (page: string) => {
        await initSettings(page);
      },
      setIsLoadedSubmenu,
      isLoadedSubmenu,
      currentDeviceType,
      isMobileView,
      isCommunity,
      brandingStore,
      settingsStore,
      common,
      clearAbortControllerArr,
      defaultTemplatesStore,
    };
  },
)(withLoading(withTranslation("Settings")(observer(TabsCommon))));
