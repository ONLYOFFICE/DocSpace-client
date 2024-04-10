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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import { StyledBaseQuotaComponent, StyledMainTitle } from "./StyledComponent";
import QuotaPerRoomComponent from "./sub-components/QuotaPerRoom";
import QuotaPerUserComponent from "./sub-components/QuotaPerUser";
import MobileQuotasComponent from "./sub-components/MobileQuotas";

const helpLink =
  "https://helpcenter.onlyoffice.com/administration/docspace-settings.aspx#StorageManagement_block";

const QuotaPerItemsComponent = ({ isStatisticsAvailable }) => {
  if (isMobile())
    return <MobileQuotasComponent isDisabled={!isStatisticsAvailable} />;

  return (
    <>
      <QuotaPerRoomComponent isDisabled={!isStatisticsAvailable} />
      <QuotaPerUserComponent />
    </>
  );
};
const QuotasComponent = (props) => {
  const { t } = useTranslation("Settings");

  const { isStatisticsAvailable } = props;

  return (
    <StyledBaseQuotaComponent>
      <div className="title-container">
        <StyledMainTitle fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </StyledMainTitle>

        {!isStatisticsAvailable && (
          <Badge
            backgroundColor="#EDC409"
            label={t("Common:Paid")}
            className="paid-badge"
            isPaidBadge
          />
        )}
      </div>
      <Text className="quotas_description">
        <Trans t={t} i18nKey="QuotasDescription" ns="Settings">
          Here, you can set storage quota for users and rooms.
          <ColorTheme
            themeId={ThemeId.Link}
            tag="a"
            isHovered={false}
            target="_blank"
            href={helpLink}
          >
            Help Center
          </ColorTheme>
        </Trans>
      </Text>

      <QuotaPerItemsComponent isStatisticsAvailable={isStatisticsAvailable} />
    </StyledBaseQuotaComponent>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(QuotasComponent));
