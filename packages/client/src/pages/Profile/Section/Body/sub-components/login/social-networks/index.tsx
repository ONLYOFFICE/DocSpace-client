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

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { SocialButton } from "@docspace/shared/components/social-button";
import { toastr } from "@docspace/shared/components/toast";

import { getAuthProviders } from "@docspace/shared/api/settings";
import { unlinkOAuth, linkOAuth } from "@docspace/shared/api/people";
import {
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/shared/utils/common";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import { AuthStore } from "@docspace/shared/store/AuthStore";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import { StyledWrapper } from "./SocialNetworks.styled";

type SocialNetworksProps = {
  providers?: UsersStore["providers"];
  setProviders?: UsersStore["setProviders"];
  capabilities?: AuthStore["capabilities"];
};

const SocialNetworks = (props: SocialNetworksProps) => {
  const { t } = useTranslation(["Profile", "Common"]);
  const { providers, setProviders, capabilities } = props;

  const linkAccount = async (
    providerName: string,
    link: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();

    try {
      // Lifehack for Twitter
      if (providerName == "twitter") {
        link += "loginCallback";
      }

      const tokenGetterWin = window.open(
        link,
        "login",
        "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no",
      );

      const code = await getOAuthToken(tokenGetterWin);
      const token = window.btoa(
        JSON.stringify({
          auth: providerName,
          mode: "popup",
          callback: "loginCallback",
        }),
      );

      if (tokenGetterWin) {
        tokenGetterWin.location.href = getLoginLink(token, code);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const unlinkAccount = (providerName: string) => {
    unlinkOAuth(providerName)?.then(() => {
      getAuthProviders().then((providersAuth) => {
        setProviders?.(providersAuth);
        toastr.success(t("ProviderSuccessfullyDisconnected"));
      });
    });
  };

  const loginCallback = (profile: unknown) => {
    linkOAuth(profile)
      ?.then(() => {
        getAuthProviders().then((providersAuth) => {
          setProviders?.(providersAuth);
          toastr.success(t("ProviderSuccessfullyConnected"));
        });
      })
      .catch((error) => {
        const message = error?.response?.data?.error?.message;
        const data =
          message === "ErrorAccountAlreadyUse"
            ? t("ErrorAccountAlreadyUse")
            : message;
        toastr.error(data);
      });
  };

  useEffect(() => {
    window.loginCallback = loginCallback;

    return () => {
      window.loginCallback = null;
    };
  }, []);

  const providerButtons =
    providers &&
    providers.map((item) => {
      if (!PROVIDERS_DATA[item.provider as keyof typeof PROVIDERS_DATA]) return;
      const { icon, label, iconOptions } =
        PROVIDERS_DATA[item.provider as keyof typeof PROVIDERS_DATA];
      if (!icon || !label) return null;

      const onClick = (e: React.MouseEvent) => {
        if (item.linked) {
          unlinkAccount(item.provider);
        } else {
          linkAccount(item.provider, item.url, e);
        }
      };

      return (
        <div key={`${item.provider}ProviderItem`}>
          <SocialButton
            IconComponent={icon}
            label={getProviderTranslation(label, t, item.linked)}
            $iconOptions={iconOptions}
            onClick={onClick}
            size="base"
            isConnect={item.linked}
          />
        </div>
      );
    });

  if (!capabilities?.oauthEnabled) return null;

  if (providers?.length === 0) return null;

  return (
    <StyledWrapper>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("ConnectSocialNetworks")}
      </Text>
      <div className="buttons">{providerButtons}</div>
    </StyledWrapper>
  );
};

export default inject(({ authStore, peopleStore }: TStore) => {
  const { usersStore } = peopleStore;
  const { providers, setProviders } = usersStore;
  const { capabilities } = authStore;

  return {
    providers,
    setProviders,
    capabilities,
  };
})(observer(SocialNetworks));
