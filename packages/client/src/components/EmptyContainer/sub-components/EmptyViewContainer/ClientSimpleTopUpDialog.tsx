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
 * are required to display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";

import { useApi } from "@docspace/ui-kit/providers/api";
import { formatCurrencyValue } from "@docspace/ui-kit/billing/utils/common";
import SimpleTopUpDialog from "@docspace/ui-kit/billing/shared/top-up-balance/SimpleTopUpDialog";
import store from "SRC_DIR/store";

type ClientSimpleTopUpDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  language?: string;
};

const ClientSimpleTopUpDialog: React.FC<ClientSimpleTopUpDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  language = "en",
}) => {
  const { paymentApi } = useApi();

  const fetchBalance = async (isRefresh?: boolean): Promise<number> => {
    return store.paymentStore.fetchWalletBalance(isRefresh);
  };

  const fetchCardLinked = async (backUrl?: string, successUrl?: string) => {
    const res = await paymentApi.getCheckoutSetupUrl(
      { backUrl: backUrl ?? window.location.href },
      { params: { successUrl } } as never,
    );
    return res?.data?.response as string | undefined;
  };

  const fetchCustomerInfo = async (isRefresh?: boolean) => {
    const payerInfo =
      await store.currentTariffStatusStore.fetchPayerInfo(isRefresh);
    return payerInfo?.email ?? null;
  };

  const walletBalance = store.paymentStore.walletBalance;
  const walletCodeCurrency = store.paymentStore.walletCodeCurrency;

  const formatWalletCurrency = (
    item: number | null = null,
    fractionDigits = 3,
  ) =>
    formatCurrencyValue(
      language,
      item ?? walletBalance,
      walletCodeCurrency,
      fractionDigits,
    );

  return (
    <SimpleTopUpDialog
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      isFirstTopUp
      paymentApi={paymentApi}
      formatWalletCurrency={formatWalletCurrency}
      walletCodeCurrency={walletCodeCurrency}
      fetchBalance={fetchBalance}
      walletCustomerStatusNotActive={
        store.currentTariffStatusStore.walletCustomerStatusNotActive
      }
      language={language}
      fetchCardLinked={fetchCardLinked}
      walletBalance={walletBalance}
      fetchCustomerInfo={fetchCustomerInfo}
    />
  );
};

export default ClientSimpleTopUpDialog;

