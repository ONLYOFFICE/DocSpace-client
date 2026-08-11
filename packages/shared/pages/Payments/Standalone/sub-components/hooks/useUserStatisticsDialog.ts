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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TLicenseQuota } from "../../../../../api/portal/types";
import { createLicenseQuotaReport } from "../../../../../api/management";
import { openUrlWithFallbackToast } from "../../../../../utils/openUrlWithFallbackToast";
import { toastr } from "@docspace/ui-kit/components/toast";

type TUserStatisticsDialogProps = {
  openOnNewPage?: boolean;
  licenseQuota?: TLicenseQuota;
};

export const useUserStatisticsDialog = ({
  licenseQuota,
  openOnNewPage,
}: TUserStatisticsDialogProps) => {
  const { t } = useTranslation("Common");
  const [visible, setVisible] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const downloadAndOpenReport = async () => {
    setIsReportLoading(true);

    try {
      const url = await createLicenseQuotaReport();

      openUrlWithFallbackToast({
        url,
        openOnNewPage: openOnNewPage ?? false,
        t,
        texts: {
          success: t("Common:ReportSaveLocation", {
            sectionName: t("Common:Files"),
          }),
          // the endpoint answers with a URL only, so the report is named after
          // the dialog it was requested from
          fileName: t("Common:EditUserStatistics"),
          sectionName: t("Common:Files"),
        },
      });
    } catch (error) {
      toastr.error(error!);
    } finally {
      setIsReportLoading(false);
    }
  };

  const usersStatistics = licenseQuota?.licenseTypeByUsers
    ? {
        limitUsers: licenseQuota.license.users_count,
        totalUsers: licenseQuota.totalUsers,
        portalUsers: licenseQuota.portalUsers,
        externalUsers: licenseQuota.externalUsers,
      }
    : null;

  return {
    isUserStatisticsVisible: visible,
    isReportLoading,
    openUserStatistics: open,
    closeUserStatistics: close,
    downloadAndOpenReport,
    usersStatistics,
  };
};
