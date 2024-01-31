import React, { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import difference from "lodash/difference";

import { CampaignsBanner } from "@docspace/shared/components/campaigns-banner";
import { ADS_TIMEOUT } from "@docspace/client/src/helpers/filesConstants";
import { LANGUAGE } from "@docspace/shared/constants";
import { getLanguage } from "@docspace/shared/utils";
import { getCookie } from "@docspace/shared/utils";

const Banner = ({ campaignsLs, setSubmitToGalleryDialogVisible }) => {
  const [campaignImage, setCampaignImage] = useState();
  const [campaignTranslate, setCampaignTranslate] = useState();
  const [campaignConfig, setCampaignConfig] = useState();
  const [currentCampaign, setCurrentCampaign] = useState();

  const lng = getCookie(LANGUAGE) || "en";
  const language = getLanguage(lng instanceof Array ? lng[0] : lng);

  const getCampaigns = () => {
    const closedCampaigns =
      JSON.parse(localStorage.getItem("closed_campaigns")) || [];
    return difference(campaignsLs, closedCampaigns);
  };

  const getImage = async (campaign) => {
    const imageUrl = await window.firebaseHelper.getCampaignsImages(campaign);
    return imageUrl;
  };

  const getTranslation = async (campaign, lng) => {
    let translationUrl = await window.firebaseHelper.getCampaignsTranslations(
      campaign,
      lng
    );

    const res = await fetch(translationUrl);

    if (!res.ok) {
      translationUrl = await window.firebaseHelper.getCampaignsTranslations(
        campaign,
        "en"
      );
    }
    return await res.json();
  };

  const getConfig = async (campaign) => {
    const configUrl = await window.firebaseHelper.getCampaignConfig(campaign);
    const res = await fetch(configUrl);
    return await res.json();
  };

  const getBanner = async () => {
    let index = Number(localStorage.getItem("bannerIndex") || 0);
    const campaigns = getCampaigns();

    if (campaigns?.length === 0) {
      return setCurrentCampaign(null);
    }

    const currentCampaign = campaigns[index];
    setCurrentCampaign(currentCampaign);

    if (campaigns.length < 1 || index + 1 >= campaigns.length) {
      index = 0;
    } else {
      index++;
    }

    localStorage.setItem("bannerIndex", index);

    const image = await getImage(currentCampaign);
    const translate = await getTranslation(currentCampaign, language);
    const config = await getConfig(currentCampaign);

    setCampaignImage(image);
    setCampaignTranslate(translate);
    setCampaignConfig(config);
  };

  const onClose = () => {
    const closedCampaigns =
      JSON.parse(localStorage.getItem("closed_campaigns")) || [];
    closedCampaigns.push(currentCampaign);
    localStorage.setItem("closed_campaigns", JSON.stringify(closedCampaigns));
    getBanner();
  };

  const onAction = (type, url) => {
    if (type === "select-form") {
      setSubmitToGalleryDialogVisible(true);
    } else {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    getBanner();
    const adsInterval = setInterval(getBanner, ADS_TIMEOUT);
    return () => clearInterval(adsInterval);
  }, []);

  return (
    <>
      {campaignImage &&
        campaignTranslate &&
        campaignConfig &&
        currentCampaign && (
          <CampaignsBanner
            campaignImage={campaignImage}
            campaignTranslate={campaignTranslate}
            campaignConfig={campaignConfig}
            onAction={onAction}
            onClose={onClose}
          />
        )}
    </>
  );
};

export default inject(({ dialogsStore }) => ({
  setSubmitToGalleryDialogVisible: dialogsStore.setSubmitToGalleryDialogVisible,
}))(observer(Banner));
