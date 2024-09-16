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

import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { getCookie } from "@docspace/shared/utils";
import { deleteCookie } from "@docspace/shared/utils/cookie";
import AppLoader from "@docspace/shared/components/app-loader";
import { frameCallEvent } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { loginWithConfirmKey } from "@docspace/shared/api/user";
import OperationContainer from "@docspace/shared/components/operation-container";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";

const AuthHandler = () => {
  let searchParams = useSearchParams();
  const { t } = useTranslation(["Common"]);

  const [authorized, setAuthorized] = useState(false);

  const { linkData } = useContext(ConfirmRouteContext);
  const { email = "", key = "" } = linkData;

  const referenceUrl = searchParams.get("referenceUrl");
  const isFileHandler =
    referenceUrl && referenceUrl.indexOf("filehandler.ashx") !== -1;
  const isExternalDownloading =
    referenceUrl && referenceUrl.indexOf("action=download") !== -1;

  useEffect(() => {
    async function loginWithKey() {
      try {
        const res = await loginWithConfirmKey({
          ConfirmData: {
            Email: email,
            Key: key,
          },
        });

        //console.log("Login with confirm key success", res);
        frameCallEvent({ event: "onAuthSuccess" });

        const redirectUrl = getCookie("x-redirect-authorization-uri");

        deleteCookie("x-redirect-authorization-uri");

        if (redirectUrl) {
          window.location.replace(redirectUrl);
          return;
        }

        if (referenceUrl && referenceUrl.includes("oauth2")) {
          const newUrl = location.search.split("referenceUrl=")[1];

          window.location.replace(newUrl);
          return;
        }

        if (referenceUrl) {
          try {
            new URL(referenceUrl);
            if (isFileHandler && isExternalDownloading) {
              setAuthorized(true);
              return;
            } else {
              return window.location.replace(referenceUrl);
            }
          } catch {
            return window.location.replace(
              combineUrl(window.location.origin, referenceUrl),
            );
          }
        }

        if (typeof res === "string") window.location.replace(res);
        else window.location.replace("/");
      } catch (error) {
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
        toastr.error(errorMessage);
      }
    }

    loginWithKey();
  });

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
