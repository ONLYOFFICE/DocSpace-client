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
            this.getIsDefaultWhiteLabel()
          );
          break;
        }
        case "language-and-time-zone":
          requests.push(
            this.settingsStore.getPortalTimezones(),
            this.settingsStore.getPortalCultures()
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
              this.settingsStore.getPortalCultures()
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
            this.getIsDefaultWhiteLabel()
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
      isManagement()
    );
    return Promise.resolve(response);
  };

  getWhiteLabelLogoUrls = async () => {
    const { whiteLabelLogoUrls } = this.settingsStore;
    const logos = JSON.parse(JSON.stringify(whiteLabelLogoUrls));
    this.setLogoUrlsWhiteLabel(Object.values(logos));
  };

  getWhiteLabelLogoText = async () => {
    const res = await api.settings.getLogoText();
    this.setLogoText(res);
    this.defaultLogoTextWhiteLabel = res;
    return res;
  };

  saveWhiteLabelSettings = async (data) => {
    const { getWhiteLabelLogoUrls } = this.settingsStore;

    await this.setWhiteLabelSettings(data);
    await getWhiteLabelLogoUrls();
    this.getWhiteLabelLogoUrls();
    this.getIsDefaultWhiteLabel();
  };

  getIsDefaultWhiteLabel = async () => {
    const res = await api.settings.getIsDefaultWhiteLabel();
    const enableRestoreButton = res.map((item) => item.default).includes(false);
    this.enableRestoreButton = enableRestoreButton;
  };

  restoreWhiteLabelSettings = async () => {
    const { getWhiteLabelLogoUrls } = this.settingsStore;

    await api.settings.restoreWhiteLabelSettings(isManagement());
    await getWhiteLabelLogoUrls();
    this.getWhiteLabelLogoUrls();
    this.getIsDefaultWhiteLabel();
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
