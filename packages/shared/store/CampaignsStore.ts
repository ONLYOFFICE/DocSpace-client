import { makeAutoObservable, runInAction } from "mobx";
import difference from "lodash/difference";

import { LANGUAGE } from "../constants";
import { getLanguage, getCookie } from "../utils";

const lng: any = getCookie(LANGUAGE) || "en";
const language = getLanguage(lng instanceof Array ? lng[0] : lng);

class CampaignsStore {
  campaignImage: string | null = null;
  campaignTranslate: string | null = null;
  campaignConfig: string | null = null;
  currentCampaign: string | null = null;
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

  getImage = async (campaign: string, standalone: boolean): Promise<string> => {
    if (standalone) {
      return `/static/campaigns/images/${campaign}.svg`;
    }
    const imageUrl = await window.firebaseHelper.getCampaignsImages(campaign);
    return imageUrl;
  };

  getTranslation = async (
    campaign: string,
    lng: string,
    standalone: boolean,
  ) => {
    let translationUrl;
    if (standalone) {
      translationUrl = `/static/campaigns/locales/${lng}/${campaign}.json`;
    } else {
      translationUrl = await window.firebaseHelper.getCampaignsTranslations(
        campaign,
        lng,
      );
    }
    const res = await fetch(translationUrl);
    return Promise.resolve(res.json());
  };

  getConfig = async (campaign: string, standalone: boolean) => {
    let configUrl;
    if (standalone) {
      configUrl = `/static/campaigns/configs/${campaign}.json`;
    } else {
      configUrl = await window.firebaseHelper.getCampaignConfig(campaign);
    }
    const res = await fetch(configUrl);
    return Promise.resolve(res.json());
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
      index++;
    }

    const currentCampaign = this.campaigns[index];

    localStorage.setItem("bannerIndex", String(index));

    const image = await this.getImage(currentCampaign, standalone);
    const translate = await this.getTranslation(
      currentCampaign,
      language,
      standalone
    );
    const config = await this.getConfig(currentCampaign, standalone);

    runInAction(() => {
      this.currentCampaign = currentCampaign;
      this.campaignImage = image;
      this.campaignTranslate = translate;
      this.campaignConfig = config;
    });
  }

  get campaignsLs() {
    return (localStorage.getItem("docspace_campaigns") || "")
      .split(",")
      .filter((campaign) => campaign.length > 0);
  }

  get campaigns() {
    return difference(this.campaignsLs, JSON.parse(this.closedCampaignsLS));
  }
}

export { CampaignsStore };
