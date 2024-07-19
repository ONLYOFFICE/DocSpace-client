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

import React, {
  ComponentType,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  TCapabilities,
  TPasswordSettings,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";
import {
  getCapabilities,
  getPortalPasswordSettings,
  getThirdPartyProviders,
  getUserByEmail,
} from "@/utils/actions";
import { TError, WithLoaderProps } from "@/types";
import { ConfirmRouteContext } from "./confirmRoute";
import Loading from "./loading";

export default function withLoader<T extends WithLoaderProps>(
  WrappedComponent: ComponentType<T>,
) {
  return function WithLoader(props: Omit<T, keyof WithLoaderProps>) {
    const { linkData } = useContext(ConfirmRouteContext);

    const [passwordSettings, setPasswordSettings] =
      useState<TPasswordSettings>();
    const [capabilities, setCapabilities] = useState<TCapabilities>();
    const [thirdPartyProviders, setThirdPartyProviders] =
      useState<TThirdPartyProvider[]>();

    const [isLoadedState, setIsLoadedState] = useState(false);
    const [error, setError] = useState<string>();

    const type = linkData ? linkData.type : null;
    const confirmHeader = linkData ? linkData.confirmHeader : null;
    const email = linkData ? linkData.email : null;

    const getData = useCallback(async () => {
      if (type === "EmpInvite" && email) {
        try {
          const response = await getUserByEmail(email, confirmHeader);

          if (response) {
            const loginData = window.btoa(
              JSON.stringify({
                type: "invitation",
                email: email,
              }),
            );

            window.location.href = combineUrl(
              window.ClientConfig?.proxy?.url,
              "/login",
              `?loginData=${loginData}`,
            );
          }

          return;
        } catch (e) {}
      }

      try {
        const response = await getPortalPasswordSettings(confirmHeader);
        if (response) setPasswordSettings(response);
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

        setError(errorMessage);
      }
    }, [confirmHeader, email, type]);

    const getInviteData = useCallback(async () => {
      try {
        const [thirdParty, capabilities] = await Promise.all([
          getThirdPartyProviders(),
          getCapabilities(),
        ]);

        if (thirdParty) setThirdPartyProviders(thirdParty);
        if (capabilities) setCapabilities(capabilities);
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
        setError(errorMessage);
      }
    }, []);

    useEffect(() => {
      if (
        (type === "PasswordChange" ||
          type === "LinkInvite" ||
          type === "Activation" ||
          type === "EmpInvite") &&
        !passwordSettings
      ) {
        getData();
      }
    }, [passwordSettings, type, getData]);

    useEffect(() => {
      if (type === "LinkInvite" || type === "EmpInvite") {
        getInviteData();
      }
    }, [type, getInviteData]);

    const isLoaded =
      type === "TfaActivation" || type === "TfaAuth"
        ? isLoadedState
        : type === "PasswordChange" ||
            type === "LinkInvite" ||
            type === "Activation" ||
            type === "EmpInvite"
          ? !!passwordSettings
          : true;

    if (!isLoaded) {
      return <Loading />;
    }

    if (error) {
      console.error(error);
      throw new Error(error);
    }

    return (
      <WrappedComponent
        {...(props as T)}
        isLoaded={isLoadedState}
        setIsLoaded={setIsLoadedState}
        passwordSettings={passwordSettings}
        capabilities={capabilities}
        thirdPartyProviders={thirdPartyProviders}
      />
    );
  };
}
