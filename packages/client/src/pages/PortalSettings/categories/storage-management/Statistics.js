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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";

import ItemIcon from "SRC_DIR/components/ItemIcon";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import { StyledStatistics, StyledMainTitle } from "./StyledComponent";

import RoomsList from "./sub-components/RoomsList";
import UsersList from "./sub-components/UsersList";

const buttonProps = {
  className: "button-element",
  size: "small",
};
const StatisticsComponent = (props) => {
  const { t } = useTranslation("Settings");
  const theme = useTheme();
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
    <StyledStatistics>
      <div className="title-container">
        <StyledMainTitle fontWeight={700} fontSize="16px">
          {t("Statistics")}
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
      <Text className="statistics-description">
        {t("StatisticDescription", { productName: t("Common:ProductName") })}
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
        </>
      ) : null}
    </StyledStatistics>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(StatisticsComponent));
