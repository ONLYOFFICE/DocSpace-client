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

"use client";

import { notFound, useSearchParams } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCookie } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";
import { logout } from "@docspace/shared/api/user";

import { AuthenticatedAction, ValidationResult } from "@/utils/enums";
import { ConfirmRouteProps, TConfirmRouteContext } from "@/types";

export const ConfirmRouteContext = createContext<TConfirmRouteContext>({
  linkData: {},
  roomData: {},
});

function ConfirmRoute(props: ConfirmRouteProps) {
  const {
    doAuthenticated = AuthenticatedAction.None,
    defaultPage = "/",
    socketUrl,
    children,
    confirmLinkResult,
    confirmLinkParams,
  } = props;

  const [stateData, setStateData] = useState<TConfirmRouteContext | undefined>(
    undefined,
  );

  const { i18n, t } = useTranslation(["Common"]);
  const searchParams = useSearchParams();
  const isAuthenticated = !!socketUrl;

  useEffect(() => {
    if (location.search.includes("culture")) return;
    const lng = getCookie(LANGUAGE);

    isAuthenticated && i18n.changeLanguage(lng);
  }, [isAuthenticated, i18n]);

  useEffect(() => {
    if (isAuthenticated) return;

    if (isAuthenticated && doAuthenticated != AuthenticatedAction.None) {
      if (doAuthenticated == AuthenticatedAction.Redirect)
        return window.location.replace(defaultPage || "/");

      if (doAuthenticated == AuthenticatedAction.Logout) logout();
    }
  }, [doAuthenticated, isAuthenticated, defaultPage, socketUrl]);

  if (!stateData) {
    switch (confirmLinkResult.result) {
      case ValidationResult.Ok:
        const confirmHeader = searchParams.toString();
        const linkData = {
          ...confirmLinkParams,
          confirmHeader,
        };

        const roomData = {
          roomId: confirmLinkResult?.roomId,
          title: confirmLinkResult?.title,
        };
        setStateData((val) => ({ ...val, linkData, roomData }));
        break;
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
        throw new Error(t("Common:Error"));
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
        throw new Error(t("Common:Error"));
      default:
        console.error("unknown link", {
          confirmLinkParams,
          validationResult: confirmLinkResult.result,
        });
        notFound();
    }
  }

  return (
    <ConfirmRouteContext.Provider
      value={{
        linkData: stateData?.linkData ?? {},
        roomData: stateData?.roomData ?? {},
      }}
    >
      {children}
    </ConfirmRouteContext.Provider>
  );
}

export default ConfirmRoute;
