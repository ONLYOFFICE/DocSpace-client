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
import difference from "lodash/difference";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";

import { LANGUAGE } from "@docspace/shared/constants";
import { getLanguage, getCookie } from "@docspace/shared/utils";
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

  getBanner = async () => {
    const { standalone } = this.settingsStore;
    const { userType } = this.userStore;

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
      index += 1;
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

    const isHide = isHideBannerForUser(userType as string, config?.hideFor);
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
