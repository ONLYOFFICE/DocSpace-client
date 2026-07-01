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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { default as ServiceCard } from "@docspace/ui-kit/billing/services/sub-components/ServiceCard";
import DocsConnectGetStartedModal from "./DocsConnectGetStartedModal";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import { getBrandName } from "@docspace/shared/constants/brands";
import type {
  TDocsConnectInfo,
  TDocsConnectPrices,
} from "@docspace/shared/api/docs-connect/types";

import DocsConnectIcon from "PUBLIC_DIR/images/icons/32/docs-connect.react.svg";

import {
  formatDocsConnectDate,
  getDocsConnectDaysLeft,
  isDocsConnectPaid,
} from "../../developer-tools/DocsConnect/utils";
import { PAYMENT_ROUTES } from "../utils";

const DOCS_CONNECT_ROUTE = PAYMENT_ROUTES.docsConnect;

interface DocsConnectServiceCardProps {
  info?: TDocsConnectInfo | null;
  prices?: TDocsConnectPrices | null;
  fetchInfo?: () => void;
  fetchPrices?: () => Promise<void>;
}

const DocsConnectServiceCard = ({
  info,
  prices,
  fetchInfo,
  fetchPrices,
}: DocsConnectServiceCardProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const navigate = useNavigate();
  const [getStartedVisible, setGetStartedVisible] = useState(false);

  useEffect(() => {
    if (!info) fetchInfo?.();
  }, [info, fetchInfo]);

  useEffect(() => {
    if (!prices) fetchPrices?.();
  }, [prices, fetchPrices]);

  const isSubscribed = !!info;

  const onCardClick = () => {
    if (isSubscribed) {
      navigate(DOCS_CONNECT_ROUTE);
      return;
    }
    setGetStartedVisible(true);
  };

  const isPaid = info ? isDocsConnectPaid(info) : false;
  const endDate = info?.tenant?.endDate;
  const currency = info?.wallet?.currency ?? "USD";
  const pricePerUser = info?.prices?.pricePerUser ?? prices?.pricePerUser;

  const docsName = `${getBrandName("OrganizationName")} ${getBrandName(
    "ProductEditorsName",
  )}`;

  const formatPrice = (value: number) =>
    formatCurrencyValue(i18n.language, value, currency, 2);

  let priceDescription = "";
  if (isSubscribed && isPaid) {
    priceDescription =
      pricePerUser != null
        ? t("DocsConnect:PricePerUser", { price: formatPrice(pricePerUser) })
        : t("DocsConnect:RenewsOn", {
            date: formatDocsConnectDate(endDate ?? ""),
          });
  } else if (isSubscribed && endDate) {
    priceDescription = t("DocsConnect:TrialDaysRemaining", {
      count: getDocsConnectDaysLeft(endDate),
    });
  } else if (pricePerUser != null) {
    priceDescription = t("DocsConnect:ServicesCardPrice", {
      price: formatPrice(pricePerUser),
    });
  } else {
    priceDescription = t("DocsConnect:TrialAvailable");
  }

  return (
    <>
      <ServiceCard
        id="docs-connect"
        serviceTitle={t("DocsConnect:DocsConnect")}
        imageNode={<DocsConnectIcon />}
        isEnabled={isSubscribed}
        priceTitle={t("DocsConnect:ServicesCardDescription", {
          productName: docsName,
        })}
        priceDescription={priceDescription}
        onClick={onCardClick}
        onToggle={onCardClick}
      />
      <DocsConnectGetStartedModal
        visible={getStartedVisible}
        onClose={() => setGetStartedVisible(false)}
      />
    </>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  prices: docsConnectStore.prices,
  fetchInfo: docsConnectStore.fetchInfo,
  fetchPrices: docsConnectStore.fetchPrices,
}))(observer(DocsConnectServiceCard));
