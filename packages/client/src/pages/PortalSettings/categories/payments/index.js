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
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Tabs } from "@docspace/shared/components/tabs";
import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";
import { isManagement } from "@docspace/shared/utils/common";

import config from "../../../../../package.json";
import PaymentsEnterprise from "./Standalone";
import PaymentsSaaS from "./SaaS";
import Wallet from "./Wallet";
import usePayments from "./usePayments";

import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

const PaymentsPage = (props) => {
  const { currentDeviceType, standalone, paymentStore } = props;
  const [currentTabId, setCurrentTabId] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation(["Payments"]);

  const defaultProps = createDefaultHookSettingsProps({
    paymentStore,
  });

  const { getWalletData, getPortalPaymentsData } = usePayments(
    defaultProps.payment,
  );

  const data = [
    {
      id: "portal-payments",
      name: t("TariffPlan"),
      content: <PaymentsSaaS />,
      onClick: getPortalPaymentsData,
    },
    {
      id: "wallet",
      name: t("Wallet"),
      content: <Wallet />,
      onClick: getWalletData,
    },
  ];

  const onSelect = (e) => {
    const url = isManagement()
      ? `/management/payments/${e.id}`
      : `/portal-settings/payments/${e.id}`;

    navigate(
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, url),
    );

    setIsLoaded(false);
  };

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);

    setIsLoaded(true);
  }, [location.pathname]);

  if (standalone) return <PaymentsEnterprise />;

  if (!isLoaded) return null;

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={(e) => onSelect(e)}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
    />
  );
};

export const Component = inject(({ settingsStore, paymentStore }) => {
  const { standalone, currentDeviceType } = settingsStore;

  return {
    standalone,
    currentDeviceType,
    paymentStore,
  };
})(observer(PaymentsPage));
