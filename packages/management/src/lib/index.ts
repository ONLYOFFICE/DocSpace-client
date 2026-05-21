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

import { parseToDateTime, now, formatDateLocalized, dateDiff } from "@docspace/ui-kit/utils/date";

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
  const dt = parseToDateTime(date)?.setZone(timezone);
  return dt?.year !== 9999;
};

export const getIsLicenseDateExpired = (
  dueDate: string | Date,
  timezone: string,
) => {
  if (!isValidDate(dueDate, timezone)) return true;
  const dueDateDt = parseToDateTime(dueDate)?.setZone(timezone);
  return dueDateDt ? now() > dueDateDt : true;
};

export const getPaymentDate = (dueDate: string | Date, timezone: string) => {
  const dt = parseToDateTime(dueDate)?.setZone(timezone);
  return dt ? formatDateLocalized(dt, "DATE_MED") : "";
};

export const getDaysLeft = (dueDate: string | Date) => {
  const dueDateDt = parseToDateTime(dueDate)?.startOf("day");
  const todayDt = now().startOf("day");
  return dueDateDt && todayDt ? dateDiff(dueDateDt, todayDt, "days") : 0;
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
