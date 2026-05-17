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

import { useSearchParams } from "next/navigation";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  getOAuthJWTSignature,
  setOAuthJWTSignature,
} from "@docspace/shared/api/oauth";
import AppLoader from "@docspace/ui-kit/components/app-loader";
import { frameCallEvent } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { loginWithConfirmKey } from "@docspace/shared/api/user";
import OperationContainer from "@docspace/shared/components/operation-container";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { getUser } from "@docspace/shared/api/people";

const AuthHandler = () => {
  const searchParams = useSearchParams();
  const { t } = useTranslation(["Common"]);

  const [authorized, setAuthorized] = useState(false);

  const { linkData, confirmLinkResult } = useContext(ConfirmRouteContext);
  const { key = "", first = "" } = linkData;
  const { email = "" } = confirmLinkResult;

  const referenceUrl = searchParams?.get("referenceUrl");
  const isFileHandler =
    referenceUrl && referenceUrl.indexOf("filehandler.ashx") !== -1;
  const isExternalDownloading =
    referenceUrl && referenceUrl.indexOf("action=download") !== -1;

  const replaced = useRef(false);

  useLayoutEffect(() => {
    if (!email || !key) return;

    async function loginWithKey() {
      try {
        if (replaced.current) return;

        replaced.current = true;

        const confirmData: { Email: string; Key: string; First?: boolean } = {
          Email: email,
          Key: key,
        };

        if (first === "true") {
          confirmData.First = true;
        }

        const res = await loginWithConfirmKey({
          ConfirmData: confirmData,
        });

        frameCallEvent({ event: "onAuthSuccess" });

        const wizard = searchParams?.get("wizard");

        if (wizard === "true") {
          localStorage.setItem("showSocialAuthWelcomeDialog", "true");
        }

        if (referenceUrl && referenceUrl.includes("oauth2")) {
          const user = await getUser();

          if (!user) {
            replaced.current = false;
            return;
          }

          const newUrl = window.location.search.split("referenceUrl=")[1];

          const token = getOAuthJWTSignature(user.id);

          if (!token) {
            await setOAuthJWTSignature(user.id);
          }

          window.location.replace(newUrl);

          return;
        }

        if (referenceUrl) {
          try {
            const url = new URL(referenceUrl);
            if (isFileHandler && isExternalDownloading) {
              setAuthorized(true);
              return;
            }
            return window.location.replace(url.toString());
          } catch {
            return window.location.replace(
              combineUrl(window.location.origin, referenceUrl),
            );
          }
        }

        if (res && res.tfa && res.confirmUrl) {
          return window.location.replace(res.confirmUrl);
        }

        if (typeof res === "string") window.location.replace(res);
        else window.location.replace("/");
      } catch (error) {
        console.log(error);
        const knownError = error as TError;
        let errorMessage: string;

        if (typeof knownError === "object") {
          errorMessage =
            knownError?.response?.data?.error?.message ||
            knownError?.statusText ||
            knownError?.message ||
            "";
        } else {
          errorMessage = knownError;
        }

        frameCallEvent({ event: "onAppError", data: errorMessage });
        replaced.current = false;
        toastr.error(errorMessage);
      }
    }

    loginWithKey();
  }, [
    email,
    key,
    referenceUrl,
    isFileHandler,
    isExternalDownloading,
    searchParams,
  ]);

  return isFileHandler && isExternalDownloading ? (
    <OperationContainer
      url={referenceUrl}
      authorized={authorized}
      title={t("DownloadOperationTitle")}
      description={t("DownloadOperationDescription")}
    />
  ) : (
    <AppLoader />
  );
};

export default AuthHandler;
