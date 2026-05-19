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

import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";

import { CampaignsBanner } from "@docspace/shared/components/campaigns-banner";
import { ADS_TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import { isDesktop } from "@docspace/shared/utils";

const Banner = ({
  setSubmitToGalleryDialogVisible,
  setClosedCampaigns,
  getBanner,
  campaignBackground,
  campaignIcon,
  campaignTranslate,
  campaignConfig,
  currentCampaign,
  hasCustomSlot,
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
    <div
      style={{ marginBottom: hasCustomSlot && !isDesktop() ? "12px" : "16px" }}
    >
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
    </div>
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
