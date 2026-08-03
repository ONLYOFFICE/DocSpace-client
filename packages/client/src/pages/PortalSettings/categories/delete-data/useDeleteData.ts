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

import React, { useCallback, useState } from "react";
import { getPaymentAccount } from "@docspace/shared/api/portal";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";

export type UseDeleteDataProps = {
  getPortalOwner?: SettingsStore["getPortalOwner"];
  addAbortControllers?: SettingsStore["addAbortControllers"];
};

const useDeleteData = ({
  getPortalOwner,
  addAbortControllers,
}: UseDeleteDataProps) => {
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  const fetchPortalDeletionData = useCallback(async () => {
    try {
      const paymentAccountController = new AbortController();
      addAbortControllers?.(paymentAccountController);

      const [, res] = await Promise.all([
        getPortalOwner?.(),
        getPaymentAccount(paymentAccountController.signal),
      ]);

      setStripeUrl(res);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.message === "canceled")
      ) {
        return;
      }

      throw error;
    }
  }, [getPortalOwner, getPaymentAccount]);

  const fetchPortalDeactivationData = useCallback(async () => {
    await getPortalOwner?.();
  }, [getPortalOwner]);

  const getDeleteDataInitialValue = React.useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("deletion"))
      actions.push(fetchPortalDeletionData());

    if (window.location.pathname.includes("deactivation"))
      actions.push(fetchPortalDeactivationData());

    await Promise.all(actions);
  }, [fetchPortalDeletionData, fetchPortalDeactivationData]);

  return {
    stripeUrl,
    fetchPortalDeletionData,
    fetchPortalDeactivationData,
    getDeleteDataInitialValue,
  };
};

export default useDeleteData;
