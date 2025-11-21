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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";
import { Link } from "@docspace/shared/components/link";

import { StyledBaseQuotaComponent, StyledMainTitle } from "./StyledComponent";
import { QuotaPerRoomComponentSection } from "./sub-components/QuotaPerRoom";
import { QuotaPerUserComponentSection } from "./sub-components/QuotaPerUser";
import MobileQuotasComponent from "./sub-components/MobileQuotas";
import { QuotaPerAIAgentComponentSection } from "./sub-components/QuotaPerAIAgent";

const QuotaPerItemsComponent = ({ isStatisticsAvailable }) => {
  if (isMobile())
    return <MobileQuotasComponent isDisabled={!isStatisticsAvailable} />;

  return (
    <>
      <QuotaPerRoomComponentSection />
      <QuotaPerUserComponentSection />
      <QuotaPerAIAgentComponentSection />
    </>
  );
};

const QuotasComponent = (props) => {
  const { t } = useTranslation("Settings");
  const theme = useTheme();

  const { isStatisticsAvailable, storageManagementUrl } = props;

  return (
    <StyledBaseQuotaComponent>
      <div className="title-container">
        <StyledMainTitle fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </StyledMainTitle>

        {!isStatisticsAvailable ? (
          <Badge
            backgroundColor={
              theme.isBase
                ? globalColors.favoritesStatus
                : globalColors.favoriteStatusDark
            }
            label={t("Common:Paid")}
            className="paid-badge"
            isPaidBadge
          />
        ) : null}
      </div>
      <Text className="quotas_description">
        {t("Settings:QuotasDescription")}{" "}
        {storageManagementUrl ? (
          <Link
            tag="a"
            isHovered={false}
            target="_blank"
            href={storageManagementUrl}
            color="accent"
            dataTestId="help_center_link"
          >
            {t("Common:HelpCenter")}
          </Link>
        ) : null}
      </Text>

      <QuotaPerItemsComponent isStatisticsAvailable={isStatisticsAvailable} />
    </StyledBaseQuotaComponent>
  );
};

export default inject(({ currentQuotaStore, settingsStore }) => {
  const { isStatisticsAvailable } = currentQuotaStore;
  const { storageManagementUrl } = settingsStore;

  return {
    isStatisticsAvailable,
    storageManagementUrl,
  };
})(observer(QuotasComponent));
