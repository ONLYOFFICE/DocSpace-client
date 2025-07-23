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

import { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/shared/components/text";
import { getSaasBar, getEnterpriseBar, checkBar } from "./helpers";

const StyledWrapper = styled.div`
  display: grid;
  cursor: pointer;

  #tariff-bar-text:hover {
    opacity: 0.85;
  }

  #tariff-bar-text:active {
    filter: brightness(0.9);
  }

  .hidden {
    display: none;
  }
`;

const PROXY_BASE_URL = combineUrl(
  window.ClientConfig?.proxy?.url,
  "/portal-settings",
);

const TariffBar = ({
  isEnterprise,
  isNonProfit,
  isGracePeriod,
  isFreeTariff,
  isPaymentPageAvailable,
  isLicenseExpiring,
  isLicenseDateExpired,
  isTrial,
  standalone,
  paymentDate,
  trialDaysLeft,
  title,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("Common");

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments",
    );
    navigate(paymentPageUrl);
  };

  useEffect(() => {
    checkBar();
  }, []);

  useEffect(() => {
    checkBar();
  }, [title]);

  const tariffBar = !standalone
    ? getSaasBar(
        t,
        isPaymentPageAvailable,
        isNonProfit,
        isFreeTariff,
        isGracePeriod,
      )
    : getEnterpriseBar(
        t,
        isPaymentPageAvailable,
        isEnterprise,
        isTrial,
        isLicenseExpiring,
        isLicenseDateExpired,
        trialDaysLeft,
        paymentDate,
      );

  if (!tariffBar) return null;
  return (
    <StyledWrapper>
      <Text
        id="tariff-bar-text"
        as="div"
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        color={tariffBar.color}
        onClick={onClick}
        truncate
      >
        {tariffBar.label}
      </Text>
    </StyledWrapper>
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    currentQuotaStore,
    currentTariffStatusStore,
  }) => {
    const { isPaymentPageAvailable } = authStore;
    const { isFreeTariff, isNonProfit, isTrial } = currentQuotaStore;
    const {
      isGracePeriod,
      isLicenseExpiring,
      isLicenseDateExpired,
      paymentDate,
      trialDaysLeft,
      isEnterprise,
    } = currentTariffStatusStore;
    const { standalone } = settingsStore;

    return {
      isEnterprise,
      isNonProfit,
      isGracePeriod,
      isFreeTariff,
      isPaymentPageAvailable,
      isLicenseExpiring,
      isLicenseDateExpired,
      isTrial,
      standalone,
      paymentDate,
      trialDaysLeft,
    };
  },
)(observer(TariffBar));
