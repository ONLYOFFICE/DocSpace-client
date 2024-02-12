import { makeAutoObservable, runInAction } from "mobx";
import difference from "lodash/difference";

import { LANGUAGE } from "../constants";
import { getLanguage, getCookie } from "../utils";
import {
  getCampaignsLs,
  getImage,
  getTranslation,
  getConfig,
} from "../utils/campaigns";

const lng: string[] | string = getCookie(LANGUAGE) || "en";
const language = getLanguage(typeof lng === "object" ? lng[0] : lng);

class CampaignsStore {
  campaignImage: string | null = null;

  campaignTranslate: string | null = null;

  campaignConfig: string | null = null;

  currentCampaign: string | unknown = null;

  closedCampaignsLS = localStorage.getItem("closed_campaigns") || "[]";

  constructor() {
    makeAutoObservable(this);
  }

  setClosedCampaigns = (campaign: string) => {
    const closedCampaigns = JSON.parse(this.closedCampaignsLS);
    closedCampaigns.push(campaign);
    localStorage.setItem("closed_campaigns", JSON.stringify(closedCampaigns));
    this.closedCampaignsLS = JSON.stringify(closedCampaigns);
  };

  getBanner = async (standalone: boolean) => {
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

    const image = await getImage(currentCampaign, standalone);
    const translate = await getTranslation(
      currentCampaign,
      language,
      standalone,
    );
    const config = await getConfig(currentCampaign, standalone);

    runInAction(() => {
      this.currentCampaign = currentCampaign;
      this.campaignImage = image;
      this.campaignTranslate = translate;
      this.campaignConfig = config;
    });
  };

  get campaigns() {
    const campaignsLs = getCampaignsLs();
    return difference(campaignsLs, JSON.parse(this.closedCampaignsLS));
  }
}

export { CampaignsStore };
