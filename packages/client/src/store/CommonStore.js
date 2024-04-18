// (c) Copyright Ascensio System SIA 2009-2024
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

import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import { setDNSSettings } from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";
import { DeviceType } from "@docspace/shared/enums";
import { isManagement } from "@docspace/shared/utils/common";

class CommonStore {
  settingsStore = null;

  logoUrlsWhiteLabel = [];
  whiteLabelLogoText = null;
  defaultLogoTextWhiteLabel = null;

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
  isLoadedAdditionalResources = false;
  isLoadedCompanyInfoSettingsData = false;

  greetingSettingsIsDefault = true;
  enableRestoreButton = false;

  constructor(settingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  resetIsInit = () => {
    this.isInit = false;
    this.setIsLoaded(false);
  };

  initSettings = async (page) => {
    const isMobileView =
      this.settingsStore.currentDeviceType === DeviceType.mobile;

    if (this.isInit) return;

    this.isInit = true;

    const { standalone } = this.settingsStore;

    const requests = [];

    if (isMobileView) {
      switch (page) {
        case "white-label": {
          requests.push(
            this.getWhiteLabelLogoUrls(),
            this.getWhiteLabelLogoText(),
            this.getIsDefaultWhiteLabel(),
          );
          break;
        }
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

        default:
          break;
      }
    } else {
      switch (page) {
        case "general":
          {
            requests.push(
              this.settingsStore.getPortalTimezones(),
              this.settingsStore.getPortalCultures(),
            );

            if (standalone) {
              requests.push(this.getDNSSettings());
            }
          }
          break;
        case "branding":
          requests.push(
            this.getWhiteLabelLogoUrls(),
            this.getWhiteLabelLogoText(),
            this.getIsDefaultWhiteLabel(),
          );
          break;

        default:
          break;
      }
    }

    return Promise.all(requests).finally(() => this.setIsLoaded(true));
  };

  setLogoUrlsWhiteLabel = (urls) => {
    this.logoUrlsWhiteLabel = urls;
  };

  setLogoText = (text) => {
    this.whiteLabelLogoText = text;
  };

  setWhiteLabelSettings = async (data) => {
    const response = await api.settings.setWhiteLabelSettings(
      data,
      isManagement(),
    );
    return Promise.resolve(response);
  };

  getWhiteLabelLogoUrls = async () => {
    const { getWhiteLabelLogoUrls } = this.settingsStore;

    const logos = await getWhiteLabelLogoUrls();

    this.setLogoUrlsWhiteLabel(Object.values(logos));

    return logos;
  };

  getWhiteLabelLogoText = async () => {
    const res = await api.settings.getLogoText(isManagement());
    this.setLogoText(res);
    this.defaultLogoTextWhiteLabel = res;
    return res;
  };

  applyNewLogos = (logos) => {
    const theme =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const favicon = document.getElementById("favicon");
    const logo = document.getElementsByClassName("logo-icon_svg")?.[0];
    const logoBurger = document.getElementsByClassName("burger-logo")?.[0];

    runInAction(() => {
      favicon && (favicon.href = logos?.[2]?.path?.["light"]); // we have single favicon for both themes
      logo && (logo.src = logos?.[0]?.path?.[theme]);
      logoBurger && (logoBurger.src = logos?.[5]?.path?.[theme]);
    });
  };

  saveWhiteLabelSettings = async (data) => {
    await this.setWhiteLabelSettings(data);

    const logos = await this.getWhiteLabelLogoUrls();
    this.getIsDefaultWhiteLabel();
    this.getWhiteLabelLogoText();

    this.applyNewLogos(logos);
  };

  getIsDefaultWhiteLabel = async () => {
    const res = await api.settings.getIsDefaultWhiteLabel(isManagement());
    const enableRestoreButton = res.map((item) => item.default).includes(false);
    this.enableRestoreButton = enableRestoreButton;
  };

  restoreWhiteLabelSettings = async () => {
    await api.settings.restoreWhiteLabelSettings(isManagement());

    const logos = await this.getWhiteLabelLogoUrls();
    this.getIsDefaultWhiteLabel();
    this.getWhiteLabelLogoText();

    this.applyNewLogos(logos);
  };

  getGreetingSettingsIsDefault = async () => {
    const isDefault = await api.settings.getGreetingSettingsIsDefault();
    runInAction(() => {
      this.greetingSettingsIsDefault = isDefault;
    });
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
    const res = await api.portal.getPortal();
    const { mappedDomain } = res;

    const tempObject = {};

    tempObject.enable = !!mappedDomain;

    if (tempObject.enable) {
      tempObject.dnsName = mappedDomain;
    }

    this.setDNSSettings(tempObject);
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

  setIsLoadedCustomization = (isLoadedCustomization) => {
    this.isLoadedCustomization = isLoadedCustomization;
  };

  setIsLoadedCustomizationNavbar = (isLoadedCustomizationNavbar) => {
    this.isLoadedCustomizationNavbar = isLoadedCustomizationNavbar;
  };

  setIsLoadedAdditionalResources = (isLoadedAdditionalResources) => {
    this.isLoadedAdditionalResources = isLoadedAdditionalResources;
  };

  setIsLoadedCompanyInfoSettingsData = (isLoadedCompanyInfoSettingsData) => {
    this.isLoadedCompanyInfoSettingsData = isLoadedCompanyInfoSettingsData;
  };

  setIsLoaded = (isLoaded) => {
    this.isLoaded = isLoaded;
  };
}

export default CommonStore;
