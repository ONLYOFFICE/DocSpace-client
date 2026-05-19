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

import React from "react";
import { useTranslation } from "react-i18next";
import { SnackBar } from "@docspace/ui-kit/components/snackbar";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import { getBrandName } from "@docspace/shared/constants/brands";

interface QuotaInfo {
  header: string;
  description: string;
}

interface BarProps {
  quotaExceededScope?: number;
}

const Bar: React.FC<BarProps> = ({ quotaExceededScope }) => {
  const { t } = useTranslation("Common");

  const [quotaInfo, setQuotaInfo] = React.useState<QuotaInfo | null>(null);

  const getQuotaInfo = (
    type: "room" | "user" | "tenant",
    initial: boolean = false,
  ): QuotaInfo => {
    switch (type) {
      case "room":
        return {
          description: initial
            ? t("EditingUnavailable")
            : t("YourFurtherEditsNotSaved"),
          header: initial ? t("RoomQuotaReached") : t("RoomQuotaLimitWarning"),
        };
      case "user":
        return {
          description: initial
            ? t("EditingUnavailable")
            : t("YourFurtherEditsNotSaved"),
          header: initial ? t("UserQuotaReached") : t("UserQuotaLimitWarning"),
        };
      case "tenant":
        return {
          description: initial
            ? t("EditingUnavailable")
            : t("YourFurtherEditsNotSaved"),
          header: initial
            ? t("PortalQuotaReached", {
                productName: getBrandName("ProductName"),
              })
            : t("PortalQuotaLimitWarning", {
                productName: getBrandName("ProductName"),
              }),
        };
    }
  };

  const onAction = () => {
    setQuotaInfo(null);
  };

  React.useEffect(() => {
    const handleQuotaChange = (eventData: {
      data: {
        id: string;
        room: string;
        scope: "room" | "user" | "tenant";
      };
    }) => {
      const payload = eventData.data;

      if (!payload || !payload.scope) {
        console.log("No scope found, returning");
        return;
      }

      const info = getQuotaInfo(payload.scope);
      setQuotaInfo(info);
    };

    SocketHelper?.on(SocketEvents.QuotaExceeded, handleQuotaChange);

    if (quotaExceededScope !== undefined) {
      const scope =
        quotaExceededScope === 0
          ? "user"
          : quotaExceededScope === 1
            ? "room"
            : "tenant";
      const info = getQuotaInfo(scope, true);
      setQuotaInfo(info);
    }

    return () => {
      SocketHelper?.off(SocketEvents.QuotaExceeded, handleQuotaChange);
    };
  }, []);

  return quotaInfo ? (
    <SnackBar
      headerText={quotaInfo.header}
      isCampaigns={false}
      opacity={1}
      countDownTime={-1}
      sectionWidth={0}
      showIcon
      additionalHeaderText={quotaInfo.description}
      onAction={onAction}
      skipBlur
    />
  ) : null;
};

export default Bar;
