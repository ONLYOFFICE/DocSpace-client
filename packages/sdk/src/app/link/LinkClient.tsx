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
import { linkOAuth } from "@docspace/shared/api/people";
import { setWithCredentialsStatus } from "@docspace/shared/api/client";

export default function LinkClient({
  providerName,
  successRedirectURL,
}: {
  providerName: string;
  successRedirectURL: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkCallback = useCallback(
    async (profile: string) => {
      localStorage.removeItem("profile");
      localStorage.removeItem("code");

      try {
        await linkOAuth(profile);

        setWithCredentialsStatus(true);

        const origin = window.location.origin;
        const basePath = "/sdk";

        let target: string;
        if (!successRedirectURL) {
          target = `${origin}${basePath}/`;
        } else if (/^https?:\/\//.test(successRedirectURL)) {
          target = successRedirectURL;
        } else {
          target = `${origin}${basePath}${successRedirectURL}`;
        }

        window.location.replace(target);
      } catch (e) {
        console.error(e);
        setError("Linking failed");
        setIsLoading(false);
      }
    },
    [successRedirectURL],
  );

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      linkCallback(profile);
    }
  }, [linkCallback]);

  useEffect(() => {
    window.authCallback = linkCallback;
  }, [linkCallback]);

  const handleLink = useCallback(() => {
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
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"
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
        Link {capitalizedProvider} Account
      </div>
      <div
        style={{
          fontSize: "13px",
          color: globalColors.gray,
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Connect your {capitalizedProvider} account to enable single sign-on.
      </div>
      {error ? <div style={{ color: "red" }}>{error}</div> : null}
      <div style={{ minWidth: "250px" }}>
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={`Link with ${capitalizedProvider}`}
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={handleLink}
        />
      </div>
    </div>
  );
}
