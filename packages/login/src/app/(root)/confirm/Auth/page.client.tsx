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

"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import {
  getOAuthJWTSignature,
  setOAuthJWTSignature,
} from "@docspace/shared/api/oauth";
import AppLoader from "@docspace/shared/components/app-loader";
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

  const { linkData } = useContext(ConfirmRouteContext);
  const { email = "", key = "" } = linkData;

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

        const res = await loginWithConfirmKey({
          ConfirmData: {
            Email: email,
            Key: key,
          },
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

        frameCallEvent({ event: "onAppError", data: error });
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
