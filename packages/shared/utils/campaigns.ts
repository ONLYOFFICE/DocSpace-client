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

export const getCampaignsLs = (standalone: boolean) => {
  if (standalone) {
    return window.ClientConfig?.campaigns || [];
  }
  return (localStorage.getItem("docspace_campaigns") || "")
    .split(",")
    .filter((campaign) => campaign.length > 0);
};

export const getImage = async (
  campaign: string,
  standalone: boolean,
  isIcon: boolean = false,
): Promise<string> => {
  if (standalone) {
    if (isIcon) {
      return `/static/campaigns/images/campaign.${campaign.toLowerCase()}.icon.svg`;
    }
    return `/static/campaigns/images/campaign.${campaign.toLowerCase()}.svg`;
  }
  const imageUrl = await window.firebaseHelper.getCampaignsImages(
    campaign,
    isIcon,
  );
  return imageUrl;
};

const checkExists = async (url: string) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getTranslation = async (
  campaign: string,
  lng: string,
  standalone: boolean,
) => {
  let translationUrl;
  if (standalone) {
    translationUrl = `/static/campaigns/locales/${lng}/Campaign${campaign}.json`;
  } else {
    translationUrl = await window.firebaseHelper.getCampaignsTranslations(
      campaign,
      lng,
    );
  }

  let exists = await checkExists(translationUrl);

  if (exists) {
    const res = await fetch(translationUrl);
    return Promise.resolve(res.json());
  }

  if (standalone) {
    translationUrl = `/static/campaigns/locales/en/Campaign${campaign}.json`;
  } else {
    translationUrl = await window.firebaseHelper.getCampaignsTranslations(
      campaign,
      "en",
    );
  }

  exists = await checkExists(translationUrl);

  if (exists) {
    const enRes = await fetch(translationUrl);
    return Promise.resolve(enRes.json());
  }

  return Promise.resolve(null);
};

export const getConfig = async (campaign: string, standalone: boolean) => {
  let configUrl;
  if (standalone) {
    configUrl = `/static/campaigns/configs/Campaign${campaign}.json`;
  } else {
    configUrl = await window.firebaseHelper.getCampaignConfig(campaign);
  }
  const exists = await checkExists(configUrl);

  if (exists) {
    const res = await fetch(configUrl);
    return Promise.resolve(res.json());
  }

  return Promise.resolve(null);
};

export const isHideBannerForUser = (userType: string, hideFor: string[]) => {
  if (hideFor.includes(userType)) return true;
  return false;
};
