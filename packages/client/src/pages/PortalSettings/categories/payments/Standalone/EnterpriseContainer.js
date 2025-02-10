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

import React from "react";

import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import BenefitsContainer from "SRC_DIR/components/StandaloneComponents/BenefitsContainer";
import { StyledEnterpriseComponent } from "./StyledComponent";
import ButtonContainer from "./sub-components/ButtonContainer";
import TariffTitleContainer from "./sub-components/TariffTitleContainer";

const EnterpriseContainer = (props) => {
  const { salesEmail, t, isLicenseDateExpired, isDeveloper } = props;

  return (
    <StyledEnterpriseComponent>
      <Text fontWeight={700} fontSize="16px">
        {t("ActivateRenewSubscriptionHeader", {
          license: isDeveloper
            ? t("Common:DeveloperLicense")
            : t("Common:EnterpriseLicense"),
        })}
      </Text>

      <TariffTitleContainer />

      {isLicenseDateExpired ? <BenefitsContainer t={t} /> : null}
      <Text fontSize="14px" className="payments_renew-subscription">
        {isLicenseDateExpired
          ? t("ActivatePurchaseBuyLicense")
          : t("ActivatePurchaseRenewLicense")}
      </Text>
      <ButtonContainer t={t} />

      <div className="payments_support">
        <Text>
          <Trans i18nKey="ActivateRenewDescr" ns="PaymentsEnterprise" t={t}>
            To get your personal renewal terms, contact your dedicated manager
            or write us at
            <ColorTheme
              fontWeight="600"
              target="_blank"
              tag="a"
              href={`mailto:${salesEmail}`}
              themeId={ThemeId.Link}
            >
              {{ email: salesEmail }}
            </ColorTheme>
          </Trans>
        </Text>
      </div>
    </StyledEnterpriseComponent>
  );
};

export default inject(({ paymentStore, currentTariffStatusStore }) => {
  const { buyUrl, salesEmail } = paymentStore;

  const { isLicenseDateExpired, isDeveloper } = currentTariffStatusStore;
  return { buyUrl, salesEmail, isLicenseDateExpired, isDeveloper };
})(observer(EnterpriseContainer));
