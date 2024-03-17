// (c) Copyright Ascensio System SIA 2010-2024
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

export const getCampaignsLs = (standalone: boolean) => {
  if (standalone) {
    return window.DocSpaceConfig?.campaigns || [];
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
    return `/static/campaigns/images/campaign.${campaign.toLowerCase()}.svg`;
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
    translationUrl = `/static/campaigns/locales/${lng}/Campaign${campaign}.json`;
  } else {
    translationUrl = await window.firebaseHelper.getCampaignsTranslations(
      campaign,
      lng,
    );
  }
  const res = await fetch(translationUrl);

  if (!res.ok) {
    if (standalone) {
      translationUrl = `/static/campaigns/locales/en/Campaign${campaign}.json`;
    } else {
      translationUrl = await window.firebaseHelper.getCampaignsTranslations(
        campaign,
        "en",
      );
    }
    const enRes = await fetch(translationUrl);
    return Promise.resolve(enRes.json());
  }

  return Promise.resolve(res.json());
};

export const getConfig = async (campaign: string, standalone: boolean) => {
  let configUrl;
  if (standalone) {
    configUrl = `/static/campaigns/configs/Campaign${campaign}.json`;
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
