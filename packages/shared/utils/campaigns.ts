export const getCampaignsLs = () => {
  if (CAMPAIGNS) {
    return CAMPAIGNS;
  }
  return (localStorage.getItem("docspace_campaigns") || "")
    .split(",")
    .filter((campaign) => campaign.length > 0);
};

export const getImage = async (
  campaign: string,
  standalone: boolean,
): Promise<string> => {
  if (standalone) {
    return `/static/campaigns/images/${campaign}.svg`;
  }
  const imageUrl = await window.firebaseHelper.getCampaignsImages(campaign);
  return imageUrl;
};

export const getTranslation = async (
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

export const getConfig = async (campaign: string, standalone: boolean) => {
  let configUrl;
  if (standalone) {
    configUrl = `/static/campaigns/configs/${campaign}.json`;
  } else {
    configUrl = await window.firebaseHelper.getCampaignConfig(campaign);
  }
  const res = await fetch(configUrl);
  return Promise.resolve(res.json());
};

export const isHideBannerForUser = (userType: string, hideFor: string[]) => {
  if (hideFor.includes(userType)) return true;
  return false;
};
