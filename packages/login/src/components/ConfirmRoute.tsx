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

"use client";

import { notFound, useSearchParams } from "next/navigation";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";
import AppLoader from "@docspace/ui-kit/components/app-loader";

import { ValidationResult } from "@/utils/enums";
import { ConfirmRouteProps, TConfirmRouteContext } from "@/types";
import { useGuestShareLink } from "@/hooks/useGuestShareLink";

export const ConfirmRouteContext = createContext<TConfirmRouteContext>({
  linkData: {},
  roomData: {},
  confirmLinkResult: {},
});

function ConfirmRoute(props: ConfirmRouteProps) {
  const { socketUrl, children, confirmLinkResult, confirmLinkParams, user } =
    props;

  const [stateData, setStateData] = useState<TConfirmRouteContext | undefined>(
    undefined,
  );

  const { onGuestsShareLinkInvalid } = useGuestShareLink();

  const { i18n, t } = useTranslation(["Common"]);
  const searchParams = useSearchParams();
  const isAuthenticated = !!socketUrl;

  if (
    confirmLinkParams.type === "GuestShareLink" &&
    user &&
    !user.isAdmin &&
    !user.isOwner &&
    !user.isRoomAdmin
  ) {
    throw new Error(t("Common:AccessDenied"));
  }

  const value = useMemo(
    () => ({
      linkData: stateData?.linkData ?? {},
      confirmLinkResult: stateData?.confirmLinkResult ?? {},
      roomData: stateData?.roomData ?? {},
    }),
    [stateData?.linkData, stateData?.roomData, stateData?.confirmLinkResult],
  );

  useEffect(() => {
    if (window.location.search.includes("culture")) return;
    const lng = getCookie(LANGUAGE);

    if (isAuthenticated) i18n.changeLanguage(lng);
  }, [isAuthenticated, i18n]);

  const isGuestShareLinkInvalid =
    confirmLinkParams.type === "GuestShareLink" &&
    confirmLinkResult.result === ValidationResult.Invalid;

  useEffect(() => {
    if (isGuestShareLinkInvalid) {
      onGuestsShareLinkInvalid();
    }
  }, [isGuestShareLinkInvalid]);

  if (isGuestShareLinkInvalid) {
    return <AppLoader />;
  }

  if (!stateData) {
    switch (confirmLinkResult.result) {
      case ValidationResult.Ok: {
        const confirmHeader = searchParams?.toString();

        const linkData = {
          ...confirmLinkParams,
          confirmHeader,
        };

        const roomData = {
          roomId: confirmLinkResult?.roomId,
          title: confirmLinkResult?.title,
          isAgent: confirmLinkResult?.isAgent,
        };
        setStateData((val) => ({
          ...val,
          linkData,
          roomData,
          confirmLinkResult,
        }));
        break;
      }
      case ValidationResult.Invalid:
        console.error("invalid link", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        throw new Error(t("Common:InvalidLink"));
      case ValidationResult.Expired:
        console.error("expired link", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        if (confirmLinkParams.type === "LinkInvite") {
          window.location.href = "/login/error/link-expired";
        } else {
          throw new Error(t("Common:LinkExpired"));
        }
        return;
      case ValidationResult.TariffLimit:
        console.error("tariff limit", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        throw new Error(t("Common:QuotaPaidUserLimitError"));
      case ValidationResult.QuotaFailed:
        console.error("access below quota", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        if (confirmLinkParams.type === "LinkInvite") {
          window.location.href = "/login/error/link-quota";
        } else {
          throw new Error(t("Common:Error"));
        }
        return;
      default:
        console.error("unknown link", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        notFound();
    }
  }

  return (
    <ConfirmRouteContext.Provider value={value}>
      {children}
    </ConfirmRouteContext.Provider>
  );
}

export default ConfirmRoute;
