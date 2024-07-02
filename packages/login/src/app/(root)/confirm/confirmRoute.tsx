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

import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCookie } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";
import { notFound, usePathname, useSearchParams } from "next/navigation";
import { getSettings, logout } from "@/utils/actions";
import { AuthenticatedAction, ValidationResult } from "@/utils/enums";
//change to a function from actions
import { checkConfirmLink } from "@docspace/shared/api/user";

interface ConfirmRouteProps {
  doAuthenticated?: AuthenticatedAction;
  children: ReactNode | string;
}

function ConfirmRoute(props: ConfirmRouteProps) {
  const { doAuthenticated = AuthenticatedAction.None, children } = props;

  const [settingsState, setSettingsState] = useState({
    defaultPage: "/",
    socketUrl: "",
    isLoadedSettings: false,
  });
  const [stateData, setStateData] = React.useState({
    linkData: {},
    roomData: {},
  });
  const [confirmLinkResult, setConfirmLinkResult] =
    useState<ValidationResult>();
  const [error, setError] = useState();

  const { i18n, t } = useTranslation(["Confirm", "Common", "Wizard"]);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isAuthenticated =
    settingsState.isLoadedSettings && !!settingsState.socketUrl;

  const getData = useCallback(() => {
    const queryParams = Object.fromEntries(new URLSearchParams(searchParams));

    const posSeparator = pathname.lastIndexOf("/");
    const type = !!posSeparator ? pathname?.slice(posSeparator + 1) : "";

    const confirmLinkData = Object.assign({ type }, queryParams);

    return { type, confirmLinkData };
  }, [pathname, searchParams]);

  const { type, confirmLinkData } = getData();

  useEffect(() => {
    getSettings().then((res) => {
      if (typeof res === "string" || !res) return;

      setSettingsState({
        defaultPage: res?.defaultPage ?? "/",
        socketUrl: res?.socketUrl,
        isLoadedSettings: true,
      });
    });
  }, []);

  useEffect(() => {
    if (location.search.includes("culture")) return;
    const lng = getCookie(LANGUAGE);

    settingsState.isLoadedSettings && i18n.changeLanguage(lng);
  }, [settingsState.isLoadedSettings, i18n]);

  useEffect(() => {
    if (!settingsState.isLoadedSettings) return;

    if (isAuthenticated && doAuthenticated != AuthenticatedAction.None) {
      if (doAuthenticated == AuthenticatedAction.Redirect)
        return window.location.replace(settingsState.defaultPage);

      if (doAuthenticated == AuthenticatedAction.Logout) logout();
    }
  }, [
    doAuthenticated,
    isAuthenticated,
    settingsState.defaultPage,
    settingsState.isLoadedSettings,
  ]);

  useEffect(() => {
    if (Object.keys(confirmLinkData).length === 0) return;

    checkConfirmLink(confirmLinkData)
      ?.then((res) => {
        setConfirmLinkResult(res.result);

        if (res.result !== ValidationResult.Ok) return;

        const confirmHeader = searchParams.toString().slice(1);
        const linkData = {
          ...confirmLinkData,
          confirmHeader,
        };

        const roomData = {
          roomId: res?.roomId,
          title: res?.title,
        };
      })
      .catch((error) => setError(error?.response?.status));
  }, [confirmLinkData, searchParams]);

  useEffect(() => {
    if (
      confirmLinkResult !== undefined &&
      confirmLinkResult !== ValidationResult.Ok
    ) {
      switch (confirmLinkResult) {
        case ValidationResult.Invalid:
        case ValidationResult.Expired:
          console.error("expired link", {
            confirmLinkData,
            confirmLinkResult,
          });
          notFound();
        case ValidationResult.TariffLimit:
          console.error("tariff limit", {
            confirmLinkData,
            confirmLinkResult,
          });
          throw new Error(t("Common:QuotaPaidUserLimitError"));
        default:
          console.error("expired link", {
            confirmLinkData,
            confirmLinkResult,
          });
          notFound();
      }
    }
  }, [confirmLinkResult, confirmLinkData, t]);

  if (!type && confirmLinkData.type)
    return (
      <Navigate
        to={`/confirm/${confirmLinkData.type}?${searchParams.toString()}`}
      />
    );

  if (error) {
    console.error("FAILED checkConfirmLink", { error, confirmLinkData });
    notFound();
  }

  return children;
}

export default ConfirmRoute;
