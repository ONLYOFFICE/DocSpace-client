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
import difference from "lodash/difference";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";

import { LANGUAGE } from "@docspace/shared/constants";
import { getLanguage } from "@docspace/shared/utils";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import {
  getCampaignsLs,
  getImage,
  getTranslation,
  getConfig,
  isHideBannerForUser,
} from "@docspace/shared/utils/campaigns";

class CampaignsStore {
  settingsStore: SettingsStore = {} as SettingsStore;

  userStore: UserStore = {} as UserStore;

  campaignBackground: string | null = null;

  campaignIcon: string | null = null;

  campaignTranslate: string | null = null;

  campaignConfig: string | null = null;

  currentCampaign: string | unknown = null;

  closedCampaignsLS = localStorage.getItem("closed_campaigns") || "[]";

  constructor(settingsStore: SettingsStore, userStore: UserStore) {
    this.settingsStore = settingsStore;
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  setClosedCampaigns = (campaign: string) => {
    const closedCampaigns = JSON.parse(this.closedCampaignsLS);
    closedCampaigns.push(campaign);
    localStorage.setItem("closed_campaigns", JSON.stringify(closedCampaigns));
    this.closedCampaignsLS = JSON.stringify(closedCampaigns);
  };

  getBanner = async (updated = false) => {
    const { standalone } = this.settingsStore;
    const { stringUserType } = this.userStore;

    const lng: string[] | string = getCookie(LANGUAGE) || "en";
    const language = getLanguage(typeof lng === "object" ? lng[0] : lng);

    let index = Number(localStorage.getItem("bannerIndex") || 0);

    if (this.campaigns.length === 0) {
      this.currentCampaign = null;
      return;
    }

    if (this.campaigns.length < 1 || index + 1 >= this.campaigns.length) {
      index = 0;
    } else {
      if (!updated) index++;
    }

    const currentCampaign = this.campaigns[index];

    localStorage.setItem("bannerIndex", String(index));

    const config = await getConfig(currentCampaign, standalone);

    if (!config) {
      return;
    }

    const image = await getImage(currentCampaign, standalone);
    const icon = await getImage(currentCampaign, standalone, true);
    const translate = await getTranslation(
      currentCampaign,
      language,
      standalone,
    );

    const isHide = isHideBannerForUser(stringUserType, config?.hideFor);
    if (isHide) {
      this.setClosedCampaigns(currentCampaign);
      this.getBanner();
    }

    runInAction(() => {
      this.currentCampaign = currentCampaign;
      this.campaignBackground = image;
      this.campaignIcon = icon;
      this.campaignTranslate = translate;
      this.campaignConfig = config;
    });
  };

  get campaigns() {
    const { standalone } = this.settingsStore;
    const campaignsLs = getCampaignsLs(standalone);
    return difference(campaignsLs, JSON.parse(this.closedCampaignsLS));
  }
}

export default CampaignsStore;
