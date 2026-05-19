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

import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

import api from "@docspace/shared/api";
import { setDNSSettings } from "@docspace/shared/api/settings";
import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType } from "@docspace/shared/enums";

class CommonStore {
  settingsStore = null;

  portalName = null;

  dnsSettings = {
    defaultObj: {},
    customObj: {},
  };

  isInit = false;

  isLoaded = false;

  isLoadedArticleBody = false;

  isLoadedSectionHeader = false;

  isLoadedSubmenu = false;

  isLoadedLngTZSettings = false;

  isLoadedDNSSettings = false;

  isLoadedPortalRenaming = false;

  isLoadedCustomization = false;

  isLoadedCustomizationNavbar = false;

  isLoadedWelcomePageSettings = false;

  isLoadedAdManagement = false;

  isLoadedConfigureDeepLink = false;

  isLoadedAiServicesManagement = false;

  greetingSettingsIsDefault = true;

  deepLinkSettings = null;

  constructor(settingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  resetIsInit = () => {
    this.isInit = false;
    this.setIsLoaded(false);
  };

  initSettings = async (page) => {
    const isMobileView = this.settingsStore.deviceType === DeviceType.mobile;

    if (this.isInit) return;

    this.isInit = Boolean(page);

    const { standalone } = this.settingsStore;

    const requests = [];

    if (isMobileView) {
      switch (page) {
        case "language-and-time-zone":
          requests.push(
            this.settingsStore.getPortalTimezones(),
            this.settingsStore.getPortalCultures(),
          );
          break;
        case "dns-settings":
          if (standalone) {
            requests.push(this.getDNSSettings());
          }
          break;
        case "configure-deep-link":
          requests.push(this.getDeepLinkSettings());
          break;
        default:
          break;
      }
    } else {
      switch (page) {
        case "general":
          requests.push(
            this.settingsStore.getPortalTimezones(),
            this.settingsStore.getPortalCultures(),
            this.getDeepLinkSettings(),
          );

          if (standalone) {
            requests.push(this.getDNSSettings());
          }

          break;
        default:
          break;
      }
    }

    return Promise.all(requests).finally(() => this.setIsLoaded(true));
  };

  getGreetingSettingsIsDefault = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const isDefault = await api.settings.getGreetingSettingsIsDefault(
        abortController.signal,
      );

      runInAction(() => {
        this.greetingSettingsIsDefault = isDefault;
      });
    } catch (error) {
      if (axios.isCancel(error)) return;

      throw error;
    }
  };

  get isDefaultDNS() {
    const { customObj, defaultObj } = this.dnsSettings;
    return (
      defaultObj.dnsName === customObj.dnsName &&
      defaultObj.enable === customObj.enable
    );
  }

  setIsEnableDNS = (value) => {
    this.dnsSettings.customObj.enable = value;
  };

  setDNSName = (value) => {
    this.dnsSettings.customObj.dnsName = value;
  };

  setPortalName = (value) => {
    this.portalName = value;
  };

  setDNSSettings = (data) => {
    this.dnsSettings = { defaultObj: data, customObj: data };
  };

  getMappedDomain = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.portal.getPortal(abortController.signal);
      const { mappedDomain } = res;

      const tempObject = {};

      tempObject.enable = !!mappedDomain;

      if (tempObject.enable) {
        tempObject.dnsName = mappedDomain;
      }

      this.setDNSSettings(tempObject);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  saveDNSSettings = async () => {
    const { customObj } = this.dnsSettings;
    const { dnsName, enable } = customObj;

    await setDNSSettings(dnsName, enable);

    try {
      this.getMappedDomain();
    } catch (e) {
      toastr.error(e);
    }
  };

  getDNSSettings = async () => {
    this.getMappedDomain();
  };

  setIsLoadedArticleBody = (isLoadedArticleBody) => {
    this.isLoadedArticleBody = isLoadedArticleBody;
  };

  setIsLoadedSectionHeader = (isLoadedSectionHeader) => {
    this.isLoadedSectionHeader = isLoadedSectionHeader;
  };

  setIsLoadedSubmenu = (isLoadedSubmenu) => {
    this.isLoadedSubmenu = isLoadedSubmenu;
  };

  setIsLoadedLngTZSettings = (isLoadedLngTZSettings) => {
    this.isLoadedLngTZSettings = isLoadedLngTZSettings;
  };

  setIsLoadedWelcomePageSettings = (isLoadedWelcomePageSettings) => {
    this.isLoadedWelcomePageSettings = isLoadedWelcomePageSettings;
  };

  setIsLoadedPortalRenaming = (isLoadedPortalRenaming) => {
    this.isLoadedPortalRenaming = isLoadedPortalRenaming;
  };

  setIsLoadedDNSSettings = (isLoadedDNSSettings) => {
    this.isLoadedDNSSettings = isLoadedDNSSettings;
  };

  setIsLoadedAdManagement = (isLoadedAdManagement) => {
    this.isLoadedAdManagement = isLoadedAdManagement;
  };

  setIsLoadedConfigureDeepLink = (isLoadedConfigureDeepLink) => {
    this.isLoadedConfigureDeepLink = isLoadedConfigureDeepLink;
  };

  setIsLoadedAiServicesManagement = (isLoadedAiServicesManagement) => {
    this.isLoadedAiServicesManagement = isLoadedAiServicesManagement;
  };

  setIsLoadedCustomization = (isLoadedCustomization) => {
    this.isLoadedCustomization = isLoadedCustomization;
  };

  setIsLoadedCustomizationNavbar = (isLoadedCustomizationNavbar) => {
    this.isLoadedCustomizationNavbar = isLoadedCustomizationNavbar;
  };

  setIsLoaded = (isLoaded) => {
    this.isLoaded = isLoaded;
  };

  getDeepLinkSettings = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getDeepLinkSettings(
        abortController.signal,
      );
      this.deepLinkSettings = res?.handlingMode;
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };
}

export default CommonStore;
