// (c) Copyright Ascensio System SIA 2009-2026
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

import { useCallback, useEffect, useState } from "react";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { getOAuthToken } from "@docspace/ui-kit/utils/get-oauth-token";
import { getLoginLink } from "@docspace/shared/utils/common";
import { thirdPartyLogin } from "@docspace/shared/api/user";
import { signupOAuth } from "@docspace/shared/api/people";
import { setWithCredentialsStatus } from "@docspace/shared/api/client";

export default function AuthClient({
  providerName,
  redirectURL,
  inviteKey,
  emplType,
  confirmHeader,
}: {
  providerName: string;
  redirectURL: string | null;
  inviteKey: string | null;
  emplType: string | null;
  confirmHeader: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authCallback = useCallback(
    async (profile: string) => {
      localStorage.removeItem("profile");
      localStorage.removeItem("code");

      try {
        let response: { confirmUrl?: string; token?: unknown };

        try {
          response = (await thirdPartyLogin(profile)) as {
            confirmUrl?: string;
            token?: unknown;
          };
        } catch (loginError) {
          const errorMessage =
            (loginError as { response?: { data?: { error?: { message?: string } } } })
              ?.response?.data?.error?.message || "";

          if (errorMessage === "user not found") {
            const signupData: Record<string, string> = {
              SerializedProfile: profile,
            };

            if (emplType) signupData.EmployeeType = emplType;
            if (inviteKey) signupData.Key = inviteKey;

            await signupOAuth(
              signupData,
              inviteKey ? confirmHeader : null,
            );

            response = (await thirdPartyLogin(profile)) as {
              confirmUrl?: string;
              token?: unknown;
            };
          } else {
            throw loginError;
          }
        }

        if (!response || (!response.token && !response.confirmUrl)) {
          throw new Error("Empty API response");
        }

        setWithCredentialsStatus(true);

        if (response.confirmUrl) {
          window.location.replace(response.confirmUrl);
          return;
        }

        window.location.replace(redirectURL || "/");
      } catch (e) {
        console.error(e);
        setError("Authentication failed");
        setIsLoading(false);
      }
    },
    [redirectURL, inviteKey, emplType, confirmHeader],
  );

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      authCallback(profile);
    }
  }, [authCallback]);

  useEffect(() => {
    window.authCallback = authCallback;
  }, [authCallback]);

  const handleLogin = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const url = `/login.ashx?auth=${providerName}&mode=popup&callback=`;

    try {
      const tokenGetterWin = window.open(
        url,
        "login",
        "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no,popup=yes",
      );

      getOAuthToken(tokenGetterWin)
        .then((code) => {
          const token = window.btoa(
            JSON.stringify({
              auth: providerName,
              mode: "popup",
              callback: "authCallback",
            }),
          );

          if (tokenGetterWin && typeof tokenGetterWin !== "string") {
            tokenGetterWin.location.href = getLoginLink(token, code);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    } catch (err) {
      console.error(err);
      setError("Failed to open login window");
      setIsLoading(false);
    }
  }, [providerName]);

  const capitalizedProvider =
    providerName.charAt(0).toUpperCase() + providerName.slice(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 14 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 4C3 1.79086 4.79086 0 7 0C9.20914 0 11 1.79086 11 4V6H12C13.1046 6 14 6.89543 14 8V14C14 15.1046 13.1046 16 12 16H2C0.89543 16 0 15.1046 0 14V8C0 6.89543 0.895431 6 2 6H3V4ZM9 4V6H5V4C5 2.89543 5.89543 2 7 2C8.10457 2 9 2.89543 9 4ZM2 8V14H12V8H2ZM7 13C8.10457 13 9 12.1046 9 11C9 9.89543 8.10457 9 7 9C5.89543 9 5 9.89543 5 11C5 12.1046 5.89543 13 7 13Z"
          fill={globalColors.gray}
        />
      </svg>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Authorization Required
      </div>
      <div
        style={{
          fontSize: "13px",
          color: globalColors.gray,
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Sign in with {capitalizedProvider} to access the chat.
      </div>
      {error ? <div style={{ color: "red" }}>{error}</div> : null}
      <Button
        primary
        size={ButtonSize.medium}
        label={
          isLoading
            ? "Loading..."
            : `Sign in with ${capitalizedProvider}`
        }
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={handleLogin}
      />
    </div>
  );
}
