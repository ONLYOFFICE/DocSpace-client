import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";

import { CampaignsBanner } from "@docspace/shared/components/campaigns-banner";
import { ADS_TIMEOUT } from "@docspace/client/src/helpers/filesConstants";

const Banner = ({
  setSubmitToGalleryDialogVisible,
  setClosedCampaigns,
  standalone,
  getBanner,
  campaignImage,
  campaignTranslate,
  campaignConfig,
  currentCampaign,
}) => {
  const updateBanner = async () => {
    await getBanner(standalone);
  };

  const onClose = () => {
    setClosedCampaigns(currentCampaign);
    updateBanner();
  };

  const onAction = (type, url) => {
    switch (type) {
      case "select-form":
        setSubmitToGalleryDialogVisible(true);
        break;
      case "open-url":
      default:
        window.open(url, "_blank");
        break;
    }
  };

  useEffect(() => {
    updateBanner();
    const adsInterval = setInterval(updateBanner, ADS_TIMEOUT);
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

export default inject(({ settingsStore, dialogsStore, campaignsStore }) => {
  const { setSubmitToGalleryDialogVisible } = dialogsStore;
  const { standalone } = settingsStore;
  const {
    setClosedCampaigns,
    getBanner,
    campaignImage,
    campaignTranslate,
    campaignConfig,
    currentCampaign,
  } = campaignsStore;

  return {
    setSubmitToGalleryDialogVisible,
    setClosedCampaigns,
    standalone,
    getBanner,
    campaignImage,
    campaignTranslate,
    campaignConfig,
    currentCampaign,
  };
})(observer(Banner));
