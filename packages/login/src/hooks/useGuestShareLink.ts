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

import { TError } from "@/types";
import { addGuest } from "@docspace/shared/api/people";
import Filter from "@docspace/shared/api/people/filter";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useState } from "react";

export const useGuestShareLink = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onGuestsShareLinkInvalid = () => {
    sessionStorage.setItem("guestShareLinkInvalid", "true");
    window.location.replace("/");
  };

  const onApproveInvite = async (email: string, confirmHeader: string) => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      await addGuest(email, confirmHeader, true);
      const newFilter = Filter.getDefault();
      newFilter.area = "guests";
      newFilter.group = null;

      window.location.replace(
        `/accounts/guests/filter?${newFilter.toUrlParams()}`,
      );
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        if (knownError.response?.status === 401) {
          window.location.replace("/");
        }

        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }
      console.error(errorMessage);

      setIsLoading(false);
      toastr.error(errorMessage);
    }
  };

  const onDenyInvite = () => {
    window.location.replace("/");
  };

  return {
    onGuestsShareLinkInvalid,
    onApproveInvite,
    onDenyInvite,
    isLoading,
  };
};
