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

import React, { useEffect, useState } from "react";
import { observer, inject } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { Loader } from "@docspace/shared/components/loader";
import axios from "axios";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import ConfirmWrapper from "./ConfirmWrapper";
import { getUserByEmail } from "@docspace/shared/api/people";

let loadTimeout = null;
export default function withLoader(WrappedComponent) {
  const withLoader = (props) => {
    const {
      tReady,
      isLoading,
      linkData,
      passwordSettings,
      getSettings,
      getPortalPasswordSettings,

      getAuthProviders,
      getCapabilities,
    } = props;
    const [inLoad, setInLoad] = useState(false);

    const type = linkData ? linkData.type : null;
    const confirmHeader = linkData ? linkData.confirmHeader : null;
    const email = linkData ? linkData.email : null;

    const navigate = useNavigate();

    const requestError = (error) => {
      let errorMessage = "";

      if (typeof error === "object") {
        errorMessage =
          error?.response?.data?.error?.message ||
          error?.statusText ||
          error?.message ||
          "";
      } else {
        errorMessage = error;
      }

      console.error(errorMessage);

      navigate(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          `/login/error?message=${errorMessage}`,
        ),
      );
    };

    const fetch = async () => {
      if (type === "EmpInvite" && email) {
        try {
          await getUserByEmail(email, confirmHeader);

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

          return;
        } catch (error) {
          requestError(error);
        }
      }

      try {
        await getPortalPasswordSettings(confirmHeader);
      } catch (error) {
        requestError(error);
      }
    };

    useEffect(() => {
      if (
        (type === "PasswordChange" ||
          type === "LinkInvite" ||
          type === "Activation" ||
          type === "EmpInvite") &&
        !passwordSettings
      ) {
        fetch();
      }
    }, [passwordSettings]);

    useEffect(() => {
      if (type === "LinkInvite" || type === "EmpInvite") {
        axios.all([getAuthProviders(), getCapabilities()]).catch((error) => {
          requestError(error);
        });
      }
    }, []);

    const isLoaded =
      type === "TfaActivation" || type === "TfaAuth"
        ? props.isLoaded
        : type === "PasswordChange" ||
            type === "LinkInvite" ||
            type === "Activation" ||
            type === "EmpInvite"
          ? !!passwordSettings
          : true;

    const cleanTimer = () => {
      loadTimeout && clearTimeout(loadTimeout);
      loadTimeout = null;
    };

    useEffect(() => {
      if (isLoading) {
        cleanTimer();
        loadTimeout = setTimeout(() => {
          setInLoad(true);
        }, 500);
      } else {
        cleanTimer();
        setInLoad(false);
      }

      return () => {
        cleanTimer();
      };
    }, [isLoading]);

    return !isLoaded || !tReady ? (
      <Loader className="pageLoader" type="rombs" size="40px" />
    ) : (
      <ConfirmWrapper>
        <WrappedComponent {...props} />
      </ConfirmWrapper>
    );
  };

  return inject(({ authStore, settingsStore, confirm }) => {
    const { isLoaded, isLoading } = confirm;
    const { passwordSettings, getSettings, getPortalPasswordSettings } =
      settingsStore;
    const { getAuthProviders, getCapabilities } = authStore;

    return {
      isLoaded,
      isLoading,
      getSettings,
      passwordSettings,
      getPortalPasswordSettings,
      getAuthProviders,
      getCapabilities,
    };
  })(observer(withLoader));
}
