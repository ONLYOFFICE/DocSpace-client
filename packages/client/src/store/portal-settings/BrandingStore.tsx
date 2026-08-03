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

import {
  getBrandName as getWhiteLabelBrandName,
  setBrandName,
  getIsDefaultWhiteLabelLogos,
  setWhiteLabelLogos,
  restoreWhiteLabelLogos,
} from "@docspace/shared/api/settings";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  isManagement,
  updateLogoTimestamp,
} from "@docspace/shared/utils/common";

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
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = (await getWhiteLabelBrandName(
        isManagement(),
        abortController.signal,
      )) as string;

      this.setBrandName(res);
      this.setDefaultBrandName(res);

      return res;
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
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
    if (logos) {
      this.setLogoUrls(Object.values(logos));
    }
    return logos;
  };

  getIsDefaultLogos = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await getIsDefaultWhiteLabelLogos(
        isManagement(),
        abortController.signal,
      );
      if (!res) return;
      const isDefaultWhiteLabel = (res as { default: boolean }[])
        .map((item) => item.default)
        .includes(false);
      this.setIsDefaultLogos(isDefaultWhiteLabel);
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
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
    if (logos) {
      this.applyNewLogos(logos);
      updateLogoTimestamp();
    }
  };

  resetWhiteLabelLogos = async () => {
    await restoreWhiteLabelLogos(isManagement());
    const logos = await this.getLogoUrls();
    this.getIsDefaultLogos();
    if (logos) {
      this.applyNewLogos(logos);
      updateLogoTimestamp();
    }
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
