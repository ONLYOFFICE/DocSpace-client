// (c) Copyright Ascensio System SIA 2009-2024
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

import moment from "moment-timezone";

import { TTranslation } from "@docspace/shared/types";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";
import type { TPortals } from "@docspace/shared/api/management/types";
import type { TDefaultWhiteLabel } from "@/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

export const getMinifyTitle = (title: string) => {
  const titleArr = title.split(" ");

  if (titleArr.length === 1) {
    return titleArr[0][0].toUpperCase();
  }
  const firstChar = titleArr[0][0].toUpperCase();
  const secondChar = titleArr[1][0].toUpperCase();
  return `${firstChar}${secondChar}`;
};

export const getHeaderByPathname = (pathname: string, t: TTranslation) => {
  const path = pathname.split("/").at(-1);

  switch (path) {
    case "spaces":
      return { key: t("Common:Spaces"), isSubPage: false };
    case "branding":
    case "data-backup":
    case "auto-backup":
    case "restore":
    case "encrypt-data":
      return { key: t("Common:Settings"), isSubPage: false };
    case "payments":
      return { key: t("Common:PaymentsTitle"), isSubPage: false };
    case "white-label":
      return { key: t("Common:WhiteLabel"), isSubPage: true };
    case "company-info":
      return { key: t("Common:CompanyInfoSettings"), isSubPage: true };
    case "additional-resources":
      return { key: t("Common:AdditionalResources"), isSubPage: true };
    case "brand-name":
      return { key: t("Common:BrandName"), isSubPage: true };
    case "bonus":
      return { key: t("Common:Bonus"), isSubPage: false };
    default:
      return { key: t("Common:Spaces"), isSubPage: false };
  }
};

export const getIsSettingsPaid = (
  isCustomizationAvailable: boolean,
  portals?: TPortals[],
) => {
  return portals?.length === 1 ? false : isCustomizationAvailable;
};

export const getIsCustomizationAvailable = (quota?: TPaymentQuota) => {
  return quota?.features.find((obj) => obj.id === "customization")
    ?.value as boolean;
};

export const getIsBrandingAvailable = (quota?: TPaymentQuota) => {
  return quota?.features.find((obj) => obj.id === "branding")?.value as boolean;
};

export const getIsDefaultWhiteLabel = (
  whiteLabelIsDefault: TDefaultWhiteLabel,
) => {
  return whiteLabelIsDefault.map((item) => item?.default).includes(false);
};

export const isValidDate = (date: string | Date, timezone: string) => {
  return moment(date).tz(timezone)?.year() !== 9999;
};

export const getIsLicenseDateExpired = (
  dueDate: string | Date,
  timezone: string,
) => {
  if (!isValidDate(dueDate, timezone)) return true;
  return moment() > moment(dueDate).tz(timezone);
};

export const getPaymentDate = (dueDate: string | Date, timezone: string) => {
  return moment(dueDate).tz(timezone)?.format("LL");
};

export const getDaysLeft = (dueDate: string | Date) => {
  return moment(dueDate).startOf("day").diff(moment().startOf("day"), "days");
};

export const getAutomaticBackupUrl = (settings?: TSettings): string => {
  if (!settings) return "";

  const domain = settings.externalResources?.helpcenter?.domain;

  const entries = settings.externalResources?.helpcenter?.entries;

  if (domain && entries) return `${domain}${entries.autobackup}`;

  return domain ?? "";
};
export const getDataBackupUrl = (settings?: TSettings): string => {
  if (!settings) return "";

  const domain = settings.externalResources?.helpcenter?.domain;

  const entries = settings.externalResources?.helpcenter?.entries;

  if (domain && entries) return `${domain}${entries.creatingbackup}`;

  return domain ?? "";
};

export const isMobileUA = (ua: string) => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
};
