import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { SocialButton } from "@docspace/shared/components/social-button";
import { toastr } from "@docspace/shared/components/toast";

import { getAuthProviders } from "@docspace/common/api/settings";
import { unlinkOAuth, linkOAuth } from "@docspace/common/api/people";
import {
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/common/utils";
import { providersData } from "@docspace/common/constants";

import { StyledWrapper } from "./styled-social-networks";

const SocialNetworks = (props) => {
  const { t } = useTranslation(["Profile", "Common"]);
  const { providers, setProviders, isOAuthAvailable, setPortalQuota } = props;

  const fetchData = async () => {
    try {
      const data = await getAuthProviders();
      if (typeof isOAuthAvailable === "undefined") await setPortalQuota();
      setProviders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const linkAccount = async (providerName, link, e) => {
    e.preventDefault();

    try {
      //Lifehack for Twitter
      if (providerName == "twitter") {
        link += "loginCallback";
      }

      const tokenGetterWin = window.open(
        link,
        "login",
        "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
      );

      const code = await getOAuthToken(tokenGetterWin);
      const token = window.btoa(
        JSON.stringify({
          auth: providerName,
          mode: "popup",
          callback: "loginCallback",
        })
      );

      tokenGetterWin.location.href = getLoginLink(token, code);
    } catch (err) {
      console.log(err);
    }
  };

  const unlinkAccount = (providerName) => {
    unlinkOAuth(providerName).then(() => {
      getAuthProviders().then((providers) => {
        setProviders(providers);
        toastr.success(t("ProviderSuccessfullyDisconnected"));
      });
    });
  };

  const loginCallback = (profile) => {
    linkOAuth(profile)
      .then(() => {
        getAuthProviders().then((providers) => {
          setProviders(providers);
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
    fetchData();
    window.loginCallback = loginCallback;

    return () => (window.loginCallback = null);
  }, []);

  const providerButtons =
    providers &&
    providers.map((item) => {
      if (!providersData[item.provider]) return;
      const { icon, label, iconOptions } = providersData[item.provider];
      if (!icon || !label) return <></>;

      const onClick = (e) => {
        if (item.linked) {
          unlinkAccount(item.provider);
        } else {
          linkAccount(item.provider, item.url, e);
        }
      };

      return (
        <div key={`${item.provider}ProviderItem`}>
          <SocialButton
            iconName={icon}
            label={getProviderTranslation(label, t, item.linked)}
            $iconOptions={iconOptions}
            onClick={onClick}
            size="base"
            isConnect={item.linked}
          />
        </div>
      );
    });

  if (!isOAuthAvailable) return <></>;
  if (providers.length === 0) return <></>;

  return (
    <StyledWrapper>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("ConnectSocialNetworks")}
      </Text>
      <div className="buttons">{providerButtons}</div>
    </StyledWrapper>
  );
};

export default inject(({ auth, peopleStore }) => {
  const { usersStore } = peopleStore;
  const { providers, setProviders } = usersStore;
  const { currentQuotaStore } = auth;
  const { isOAuthAvailable, setPortalQuota } = currentQuotaStore;

  return {
    providers,
    setProviders,
    isOAuthAvailable,
    setPortalQuota,
  };
})(observer(SocialNetworks));
