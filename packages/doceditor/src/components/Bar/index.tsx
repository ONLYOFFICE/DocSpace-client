// (c) Copyright Ascensio System SIA 2009-2026
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
