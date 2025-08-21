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

import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import styled from "styled-components";

import { CampaignsBanner } from "@docspace/shared/components/campaigns-banner";
import { ADS_TIMEOUT } from "SRC_DIR/helpers/filesConstants";

const StyledWrapper = styled.div`
  margin-bottom: 16px;
`;

const Banner = ({
  setSubmitToGalleryDialogVisible,
  setClosedCampaigns,
  getBanner,
  campaignBackground,
  campaignIcon,
  campaignTranslate,
  campaignConfig,
  currentCampaign,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const updateBanner = async () => {
    await getBanner();
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

  useEffect(() => {
    const isVisibleStorage = localStorage.getItem("integrationUITests");

    if (isVisibleStorage) setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <StyledWrapper>
      {campaignBackground &&
      campaignTranslate &&
      campaignConfig &&
      currentCampaign ? (
        <CampaignsBanner
          campaignBackground={campaignBackground}
          campaignIcon={campaignIcon}
          campaignTranslate={campaignTranslate}
          campaignConfig={campaignConfig}
          onAction={onAction}
          onClose={onClose}
        />
      ) : null}
    </StyledWrapper>
  );
};

export default inject(({ dialogsStore, campaignsStore }) => {
  const { setSubmitToGalleryDialogVisible } = dialogsStore;
  const {
    setClosedCampaigns,
    getBanner,
    campaignBackground,
    campaignIcon,
    campaignTranslate,
    campaignConfig,
    currentCampaign,
  } = campaignsStore;

  return {
    setSubmitToGalleryDialogVisible,
    setClosedCampaigns,
    getBanner,
    campaignBackground,
    campaignIcon,
    campaignTranslate,
    campaignConfig,
    currentCampaign,
  };
})(observer(Banner));
