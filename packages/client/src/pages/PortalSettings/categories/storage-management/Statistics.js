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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { Text } from "@docspace/ui-kit/components/text";
import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import ItemIcon from "SRC_DIR/components/ItemIcon";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import styles from "./StyledComponent.module.scss";

import RoomsList from "./sub-components/RoomsList";
import UsersList from "./sub-components/UsersList";
import AIAgentList from "./sub-components/AIAgentList.js";
import { getBrandName } from "@docspace/shared/constants/brands";

const buttonProps = {
  className: "button-element",
  size: "small",
};
const StatisticsComponent = (props) => {
  const { t } = useTranslation("Settings");
  const { isBase } = useTheme();
  const { isStatisticsAvailable } = props;

  const iconElement = (
    id,
    icon,
    fileExst,
    isRoom,
    defaultRoomIcon,
    className,
    title,
    color,
    logo,
  ) => (
    <div className={className}>
      <ItemIcon
        id={id}
        icon={icon}
        fileExst={fileExst}
        isRoom={isRoom}
        defaultRoomIcon={defaultRoomIcon}
        showDefault={!(!!logo?.cover || !!logo?.medium) ? isRoom : null}
        title={title}
        color={color}
        logo={logo}
      />
    </div>
  );
  const quotaElement = (item, type) => (
    <SpaceQuota isReadOnly item={item} type={type} />
  );
  const textElement = (title) => (
    <div className="row_name">
      <Text fontSize="12px" fontWeight={600}>
        {title}
      </Text>
    </div>
  );

  return (
    <div className={styles.statistics}>
      <div className="title-container">
        <Text className={styles.mainTitle} fontWeight={700} fontSize="16px">
          {t("Statistics")}
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
      <Text className="statistics-description">
        {t("StatisticDescription", { productName: getBrandName("ProductName") })}
      </Text>
      {isStatisticsAvailable ? (
        <>
          <RoomsList
            buttonProps={buttonProps}
            textElement={textElement}
            quotaElement={quotaElement}
            iconElement={iconElement}
          />
          <UsersList
            buttonProps={buttonProps}
            textElement={textElement}
            quotaElement={quotaElement}
            iconElement={iconElement}
          />
          <AIAgentList
            buttonProps={buttonProps}
            textElement={textElement}
            quotaElement={quotaElement}
            iconElement={iconElement}
          />
        </>
      ) : null}
    </div>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(StatisticsComponent));
