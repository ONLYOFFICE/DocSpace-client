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

import { Trans, useTranslation } from "react-i18next";
import { Text } from "@docspace/ui-kit/components/text";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import { TUserStatisticsInfoProps } from "../UserStatisticsDialog.types";
import styles from "../UserStatisticsDialog.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const UserStatisticsInfo = ({
  statistics,
}: TUserStatisticsInfoProps) => {
  const { t } = useTranslation(["Common"]);

  const { limitUsers, portalUsers, totalUsers, externalUsers } = statistics;

  const percentEditing = Math.round((totalUsers / limitUsers) * 100);

  const detailedEditInfo = () => {
    const portalUsersText = portalUsers
      ? t("EditUserCount", {
          count: portalUsers,
          productName: getBrandName("ProductName"),
        })
      : null;

    const externalUserText = externalUsers
      ? t("EditExternalUserCount", {
          externalCount: externalUsers,
        })
      : null;

    const detailedInfo = [portalUsersText, externalUserText]
      .filter(Boolean)
      .map((item, index, arr) => {
        return index === arr.length - 1 ? item : `${item} / `;
      });

    if (detailedInfo.length === 0) {
      return null;
    }

    return ` (${detailedInfo.join("")})`;
  };

  return (
    <div>
      <div className={styles.textContainer}>
        <Text lineHeight="20px">
          <Trans
            i18nKey="EditUserLimit"
            t={t}
            values={{ limit: limitUsers }}
            components={{ 1: <Text fontWeight={600} as="span" /> }}
          />
        </Text>
        <Text lineHeight="20px">
          <Trans
            i18nKey="EditUserInfo"
            t={t}
            values={{
              editingCount: totalUsers,
              count: portalUsers,
              externalCount: externalUsers,
              productName: getBrandName("ProductName"),
            }}
            components={{ 1: <Text fontWeight={600} as="span" /> }}
          />
          {detailedEditInfo()}
        </Text>
      </div>
      <ProgressBar percent={percentEditing} />
    </div>
  );
};
