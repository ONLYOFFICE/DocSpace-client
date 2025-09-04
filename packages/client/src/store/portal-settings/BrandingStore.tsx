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

import { makeAutoObservable, runInAction } from "mobx";

import {
  getBrandName as getWhiteLabelBrandName,
  setBrandName,
  getIsDefaultWhiteLabelLogos,
  setWhiteLabelLogos,
  restoreWhiteLabelLogos,
} from "@docspace/shared/api/settings";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { isManagement } from "@docspace/shared/utils/common";

import { ILogo } from "@docspace/shared/pages/Branding/WhiteLabel/WhiteLabel.types";

class BrandingStore {
  isLoadedAdditionalResources = false;

  isLoadedCompanyInfoSettingsData = false;

  logoUrls: ILogo[] = [];

  brandName = "";

  defaultBrandName = "";

  isDefaultLogos = false;

  settingsStore: SettingsStore = {} as SettingsStore;

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  setIsLoadedAdditionalResources = (isLoaded: boolean) => {
    this.isLoadedAdditionalResources = isLoaded;
  };

  setIsLoadedCompanyInfoSettingsData = (isLoaded: boolean) => {
    this.isLoadedCompanyInfoSettingsData = isLoaded;
  };

  setBrandName = (text: string) => {
    this.brandName = text;
  };

  setDefaultBrandName = (text: string) => {
    this.defaultBrandName = text;
  };

  getBrandName = async () => {
    const res = (await getWhiteLabelBrandName(isManagement())) as string;
    this.setBrandName(res);
    this.setDefaultBrandName(res);
    return res;
  };

  setLogoUrls = (urls: ILogo[]) => {
    this.logoUrls = urls;
  };

  setIsDefaultLogos = (isDefault: boolean) => {
    this.isDefaultLogos = isDefault;
  };

  getLogoUrls = async () => {
    const { getWhiteLabelLogoUrls } = this.settingsStore;
    const logos = await getWhiteLabelLogoUrls();
    this.setLogoUrls(Object.values(logos));
    return logos;
  };

  getIsDefaultLogos = async () => {
    const res = await getIsDefaultWhiteLabelLogos(isManagement());
    if (!res) return;
    const isDefaultWhiteLabel = (res as { default: boolean }[])
      .map((item) => item.default)
      .includes(false);
    this.setIsDefaultLogos(isDefaultWhiteLabel);
  };

  applyNewLogos = (logos: ILogo[]) => {
    const theme = this.settingsStore.theme.isBase ? "light" : "dark";

    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    const logo = document.getElementsByClassName(
      "logo-icon_svg",
    )?.[0] as HTMLImageElement;
    const logoBurger = document.getElementsByClassName(
      "burger-logo",
    )?.[0] as HTMLImageElement;

    runInAction(() => {
      favicon && (favicon.href = logos?.[2]?.path?.light); // we have single favicon for both themes
      logo && (logo.src = logos?.[0]?.path?.[theme]);
      logoBurger && (logoBurger.src = logos?.[5]?.path?.[theme]);
    });
  };

  saveBrandName = async (data: string) => {
    await setBrandName(data, isManagement());
    this.settingsStore.getPortalSettings();
    this.getBrandName();
  };

  saveWhiteLabelLogos = async (data: ILogo[]) => {
    await setWhiteLabelLogos(data, isManagement());
    this.settingsStore.getPortalSettings();
    const logos = await this.getLogoUrls();
    this.getIsDefaultLogos();
    this.applyNewLogos(logos);
  };

  resetWhiteLabelLogos = async () => {
    await restoreWhiteLabelLogos(isManagement());
    const logos = await this.getLogoUrls();
    this.getIsDefaultLogos();
    this.applyNewLogos(logos);
  };

  initWhiteLabel = async () => {
    await Promise.all([this.getLogoUrls(), this.getIsDefaultLogos()]);
  };

  get isWhiteLabelLoaded() {
    return this.logoUrls.length > 0;
  }

  get isBrandNameLoaded() {
    return this.brandName !== undefined && this.defaultBrandName !== undefined;
  }
}

export default BrandingStore;
