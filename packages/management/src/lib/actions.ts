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

"use server";

import { headers } from "next/headers";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  TSettings,
  TGetColorTheme,
  TVersionBuild,
  TPaymentSettings,
  TStorageBackup,
  TEncryptionSettings,
} from "@docspace/shared/api/settings/types";
import type { TGetAllPortals } from "@docspace/shared/api/management/types";
import type {
  TBackupProgress,
  TBackupSchedule,
  TPaymentQuota,
  TPortalTariff,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";
import type {
  SettingsThirdPartyType,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import {
  getFolderClassNameByType,
  sortInDisplayOrder,
} from "@docspace/shared/utils/common";
import { TError } from "@docspace/shared/utils/axiosClient";

import { logger } from "@/../logger.mjs";

export async function getUser() {
  logger.debug(`Start GET /people/@self`);
  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getUsersRes] = await createRequest(
      [`/people/@self`],
      [["", ""]],
      "GET",
    );

    if (!cookie?.includes("asc_auth_key")) return undefined;
    const userRes = await fetch(getUsersRes);

    if (userRes.status === 401) {
      logger.error(`GET /people/@self failed: ${userRes.status}`);
      return undefined;
    }

    if (!userRes.ok) {
      logger.error(`GET /people/@self failed: ${userRes.status}`);
      return;
    }

    const user = await userRes.json();

    return user.response as TUser;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getUser: ${error}`);
  }
}

export async function getSettings(share?: string) {
  logger.debug(`Start GET /settings?withPassword={}`);
  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getSettingsRes] = await createRequest(
      [
        `/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
      ],
      [share ? ["Request-Token", share] : ["", ""]],
      "GET",
    );

    const settingsRes = await fetch(getSettingsRes);

    if (settingsRes.status === 403) {
      logger.error(
        `GET /settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"} failed: access-restricted`,
      );
      return `access-restricted`;
    }

    if (!settingsRes.ok) {
      logger.error(
        `GET /settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"} failed: ${settingsRes.statusText}`,
      );
      return;
    }

    const settings = await settingsRes.json();

    return settings.response as TSettings;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getSettings: ${error}`);
  }
}

export async function getVersionBuild() {
  logger.debug("Start GET /settings/version/build");
  try {
    const [getSettingssRes] = await createRequest(
      [`/settings/version/build`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getSettingssRes);

    if (!res.ok) {
      logger.error(`GET /settings/version/build failed: ${res.statusText}`);
      return;
    }

    const versionBuild = await res.json();

    return versionBuild.response as TVersionBuild;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getVersionBuild: ${error}`);
  }
}

export async function getQuota() {
  logger.debug("Start GET /portal/payment/quota");
  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getQuotasRes] = await createRequest(
      [`/portal/payment/quota`],
      [["", ""]],
      "GET",
    );

    if (!cookie?.includes("asc_auth_key")) {
      logger.debug(`GET /portal/payment/quota failed: missing asc_auth_key`);
      return undefined;
    }
    const quotaRes = await fetch(getQuotasRes);

    if (quotaRes.status === 401) {
      logger.error(`GET /portal/payment/quota failed: ${quotaRes.statusText}`);
      return undefined;
    }

    if (!quotaRes.ok) {
      logger.error(`GET /portal/payment/quota failed: ${quotaRes.statusText}`);
      return;
    }

    const quota = await quotaRes.json();

    return quota.response as TPaymentQuota;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getQuota: ${error}`);
  }
}

export async function getAllPortals() {
  logger.debug("Start GET /portal/get?statistics=true");

  try {
    const [getAllPortalssRes] = await createRequest(
      [`/portal/get?statistics=true`],
      [["", ""]],
      "GET",
      undefined,
      true,
    );

    const portalsRes = await fetch(getAllPortalssRes);

    if (!portalsRes.ok) {
      logger.error(
        `GET /portal/get?statistics=true failed: ${portalsRes.statusText}`,
      );
      return;
    }

    const portals = await portalsRes.json();

    return portals as TGetAllPortals;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getAllPortals: ${error}`);
  }
}

export async function getPortalTariff() {
  logger.debug("Start GET /portal/tariff");

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getPortalTariffsRes] = await createRequest(
      [`/portal/tariff`],
      [["", ""]],
      "GET",
    );

    if (!cookie?.includes("asc_auth_key")) {
      logger.debug(`GET /portal/tariff failed: missing asc_auth_key`);
      return undefined;
    }
    const portalTariffRes = await fetch(getPortalTariffsRes);

    if (portalTariffRes.status === 401) {
      logger.error(`GET /portal/tariff failed: ${portalTariffRes.statusText}`);
      return undefined;
    }

    if (!portalTariffRes.ok) {
      logger.error(`GET /portal/tariff failed: ${portalTariffRes.statusText}`);
      return;
    }

    const portalTariff = await portalTariffRes.json();

    return portalTariff.response as TPortalTariff;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getPortalTariff: ${error}`);
  }
}

export async function getColorTheme() {
  try {
    logger.debug("Start GET /settings/colortheme");

    const [getSettingssRes] = await createRequest(
      [`/settings/colortheme`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getSettingssRes);

    if (!res.ok) {
      logger.error(`GET /settings/colortheme failed: ${res.status}`);
      return;
    }

    const colorTheme = await res.json();

    return colorTheme.response as TGetColorTheme;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getColorTheme: ${error}`);
  }
}

export async function getWhiteLabelLogos() {
  logger.debug("Start GET /settings/whitelabel/logos?isDefault=true");

  try {
    const [getWhiteLabelLogossRes] = await createRequest(
      [`/settings/whitelabel/logos?isDefault=true`],
      [["", ""]],
      "GET",
    );

    const logosRes = await fetch(getWhiteLabelLogossRes);

    if (!logosRes.ok) {
      logger.error(
        `GET /settings/whitelabel/logos?isDefault=true failed: ${logosRes.statusText}`,
      );
      return;
    }

    const logos = await logosRes.json();

    return logos.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getWhiteLabelLogos: ${error}`);
  }
}

export async function getWhiteLabelText() {
  logger.debug("Start GET /settings/whitelabel/logotext?isDefault=true");
  try {
    const [getWhiteLabelTextsRes] = await createRequest(
      [`/settings/whitelabel/logotext?isDefault=true`],
      [["", ""]],
      "GET",
    );

    const textRes = await fetch(getWhiteLabelTextsRes);

    if (!textRes.ok) {
      logger.error(
        `GET /settings/whitelabel/logotext?isDefault=true failed: ${textRes.statusText}`,
      );
      return;
    }

    const text = await textRes.json();

    return text.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getWhiteLabelText: ${error}`);
  }
}

export async function getWhiteLabelIsDefault() {
  logger.debug("Start GET /settings/whitelabel/logos/isdefault?isDefault=true");
  try {
    const [getWhiteLabelIsDefaultsRes] = await createRequest(
      [`/settings/whitelabel/logos/isdefault?isDefault=true`],
      [["", ""]],
      "GET",
    );

    const isDefaultRes = await fetch(getWhiteLabelIsDefaultsRes);

    if (!isDefaultRes.ok) {
      logger.error(
        `GET /settings/whitelabel/logos/isdefault?isDefault=true failed: ${isDefaultRes.statusText}`,
      );
      return;
    }

    const isDefault = await isDefaultRes.json();

    return isDefault.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getWhiteLabelIsDefault: ${error}`);
  }
}

export async function getAdditionalResources() {
  logger.debug("Start GET /settings/rebranding/additional");

  try {
    const [getAdditionalResourcessRes] = await createRequest(
      [`/settings/rebranding/additional`],
      [["", ""]],
      "GET",
    );

    const additionalResourcesRes = await fetch(getAdditionalResourcessRes);

    if (!additionalResourcesRes.ok) {
      logger.error(
        `GET /settings/rebranding/additional failed: ${additionalResourcesRes.statusText}`,
      );
      return;
    }

    const additionalResources = await additionalResourcesRes.json();

    return additionalResources.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getAdditionalResources: ${error}`);
  }
}

export async function getCompanyInfo() {
  logger.debug("Start GET /settings/rebranding/company");

  try {
    const [getCompanyInfosRes] = await createRequest(
      [`/settings/rebranding/company`],
      [["", ""]],
      "GET",
    );

    const companyInfoRes = await fetch(getCompanyInfosRes);

    if (!companyInfoRes.ok) {
      logger.error(
        `GET /settings/rebranding/company failed: ${companyInfoRes.statusText}`,
      );
      return;
    }

    const companyInfo = await companyInfoRes.json();

    return companyInfo.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getCompanyInfo: ${error}`);
  }
}

export async function getPaymentSettings() {
  logger.debug("Start GET /settings/payment");

  try {
    const [getPaymentSettingssRes] = await createRequest(
      [`/settings/payment`],
      [["", ""]],
      "GET",
    );

    const paymentSettingsRes = await fetch(getPaymentSettingssRes);

    if (!paymentSettingsRes.ok) {
      logger.error(
        `GET /settings/payment failed: ${paymentSettingsRes.statusText}`,
      );
      return;
    }

    const paymentSettings = await paymentSettingsRes.json();

    return paymentSettings.response as TPaymentSettings;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getPaymentSettings: ${error}`);
  }
}

export async function getSettingsThirdParty() {
  logger.debug("Start GET /files/thirdparty/backup");

  try {
    const [getSettingsThirdPartysRes] = await createRequest(
      [`/files/thirdparty/backup`],
      [["", ""]],
      "GET",
    );

    const settingsThirdParty = await fetch(getSettingsThirdPartysRes, {
      next: { tags: ["backup"] },
    });

    if (!settingsThirdParty.ok) {
      logger.error(
        `GET /files/thirdparty/backup failed: ${settingsThirdParty.statusText}`,
      );
      return;
    }

    const settingsThirdPartyRes = await settingsThirdParty.json();

    return settingsThirdPartyRes.response as SettingsThirdPartyType;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getSettingsThirdParty: ${error}`);
  }
}

export async function getBackupSchedule(dump: boolean = true) {
  try {
    const searchParams = new URLSearchParams();

    searchParams.append("dump", dump.toString());

    logger.debug(`Start GET /portal/getbackupschedule?${searchParams}`);

    const [getBackupSchedulesRes] = await createRequest(
      [`/portal/getbackupschedule?${searchParams}`],
      [["", ""]],
      "GET",
    );

    const backupScheduleRes = await fetch(getBackupSchedulesRes, {
      next: { tags: ["backup"] },
    });

    if (!backupScheduleRes.ok) {
      logger.error(
        `GET /portal/getbackupschedule?${searchParams} failed: ${backupScheduleRes.statusText}`,
      );
      return;
    }

    const backupSchedule = await backupScheduleRes.json();

    return backupSchedule.response as TBackupSchedule;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getBackupSchedule: ${error}`);
  }
}

export async function getBackupStorage(dump: boolean = false) {
  try {
    const searchParams = new URLSearchParams();

    searchParams.append("dump", dump.toString());

    logger.debug(`Start GET /settings/storage/backup?${searchParams}`);

    const [getBackupStoragesRes] = await createRequest(
      [`/settings/storage/backup?${searchParams}`],
      [["", ""]],
      "GET",
    );
    const backupStorageRes = await fetch(getBackupStoragesRes, {
      next: { tags: ["backup"] },
    });

    if (!backupStorageRes.ok) {
      logger.error(
        `GET /settings/storage/backup?${searchParams} failed: ${backupStorageRes.statusText}`,
      );
      return;
    }

    const backupStorage = await backupStorageRes.json();

    return backupStorage.response as TStorageBackup[];
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getBackupStorage: ${error}`);
  }
}

export async function getStorageRegions() {
  logger.debug("Start GET /settings/storage/s3/regions");

  try {
    const [getStorageRegionssRes] = await createRequest(
      [`/settings/storage/s3/regions`],
      [["", ""]],
      "GET",
    );

    const storageRegionsRes = await fetch(getStorageRegionssRes);

    if (!storageRegionsRes.ok) {
      logger.error(
        `GET /settings/storage/s3/regions failed: ${storageRegionsRes.statusText}`,
      );
      return;
    }

    const storageRegions = await storageRegionsRes.json();

    return storageRegions.response as TStorageRegion[];
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getStorageRegions: ${error}`);
  }
}

export async function getSettingsFiles(): Promise<TFilesSettings> {
  logger.debug("Start GET /files/settings");
  try {
    const [getSettingsFilessRes] = await createRequest(
      [`/files/settings`],
      [["", ""]],
      "GET",
    );

    const settingsFilesRes = await fetch(getSettingsFilessRes);

    if (!settingsFilesRes.ok) {
      logger.error(
        `GET /files/settings failed: ${settingsFilesRes.statusText}`,
      );
      return {} as TFilesSettings;
    }

    const settingsFiles = await settingsFilesRes.json();

    return settingsFiles.response;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getSettingsFiles: ${error}`);
    return {} as TFilesSettings;
  }
}

export async function getBackupProgress(dump = true) {
  try {
    const searchParams = new URLSearchParams();

    searchParams.append("dump", dump.toString());

    logger.debug(`Start GET /portal/getbackupprogress?${searchParams}`);

    const [getBackupProgresssRes] = await createRequest(
      [`/portal/getbackupprogress?${searchParams}`],
      [["", ""]],
      "GET",
    );

    const backupProgressRes = await fetch(getBackupProgresssRes, {
      next: { tags: ["backup"] },
    });

    if (!backupProgressRes.ok) {
      logger.error(
        `GET /portal/getbackupprogress?${searchParams} failed: ${backupProgressRes.statusText}`,
      );
      return;
    }

    const backupProgress = await backupProgressRes.json();

    return backupProgress.response as TBackupProgress | undefined;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getBackupProgress: ${error}`);
    return error as TError;
  }
}

export async function getFoldersTree() {
  logger.debug("Start GET /files/@root?filterType=2&count=1");

  try {
    const [getFoldersTreeRes] = await createRequest(
      ["/files/@root?filterType=2&count=1"],
      [["", ""]],
      "GET",
    );

    const foldersTreeRes = await fetch(getFoldersTreeRes);

    if (!foldersTreeRes.ok) {
      logger.error(
        `GET /files/@root?filterType=2&count=1 failed: ${foldersTreeRes.status}`,
      );
      return [];
    }

    const foldersTree = await foldersTreeRes.json();

    const folders = sortInDisplayOrder(foldersTree.response);

    return folders.map((data, index) => {
      const { new: newItems, pathParts, current } = data;

      const {
        parentId,
        title,
        id,
        rootFolderType,
        security,
        foldersCount,
        filesCount,
      } = current;

      const type = +rootFolderType;

      const name = getFolderClassNameByType(type);

      return {
        ...current,
        id,
        key: `0-${index}`,
        parentId,
        title,
        rootFolderType: type,
        folderClassName: name,
        folders: null,
        pathParts,
        foldersCount,
        filesCount,
        newItems,
        security,
        new: newItems,
      } as TFolder;
    });
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getFoldersTree: ${error}`);
    return [];
  }
}

export async function getEncryptionSettings() {
  logger.debug("Start GET /settings/encryption/settings");

  try {
    const [getEncryptionSettingsRes] = await createRequest(
      [`/settings/encryption/settings`],
      [["", ""]],
      "GET",
    );

    const encryptionSettingsRes = await fetch(getEncryptionSettingsRes);

    if (!encryptionSettingsRes.ok) {
      logger.error(
        `GET /settings/encryption/settings failed: ${encryptionSettingsRes.status}`,
      );
      return;
    }

    const encryptionSettings = await encryptionSettingsRes.json();

    return encryptionSettings.response as TEncryptionSettings;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getEncryptionSettings: ${error}`);
  }
}
