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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/ui-kit/components/text";
import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Link } from "@docspace/ui-kit/components/link";

import styles from "./StyledComponent.module.scss";
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
  const { isBase } = useTheme();

  const { isStatisticsAvailable, storageManagementUrl } = props;

  return (
    <div className={styles.baseQuotaComponent}>
      <div className="title-container">
        <Text className={styles.mainTitle} fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </Text>

        {!isStatisticsAvailable ? (
          <Badge
            backgroundColor={
              isBase
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
    </div>
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
