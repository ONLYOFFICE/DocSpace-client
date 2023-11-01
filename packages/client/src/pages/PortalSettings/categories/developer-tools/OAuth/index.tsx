import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { useViewEffect } from "@docspace/common/hooks";

//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
//@ts-ignore
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import OAuthEmptyScreen from "./sub-components/EmptyScreen";
import List from "./sub-components/List";

import { OAuthContainer } from "./StyledOAuth";
import { OAuthProps } from "./OAuth.types";

const MIN_LOADER_TIME = 500;

const OAuth = ({
  clientList,
  viewAs,
  isEmptyClientList,
  setViewAs,
  fetchClients,
  currentDeviceType,
}: OAuthProps) => {
  const { t } = useTranslation(["OAuth"]);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const startLoadingRef = React.useRef<null | Date>(null);

  const getClientList = React.useCallback(async () => {
    await fetchClients();

    if (startLoadingRef.current) {
      const currentDate = new Date();

      const ms = Math.abs(
        startLoadingRef.current.getTime() - currentDate.getTime()
      );

      if (ms < MIN_LOADER_TIME)
        return setTimeout(() => {
          setIsLoading(false);
        }, MIN_LOADER_TIME - ms);
    }

    setIsLoading(false);
  }, []);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  React.useEffect(() => {
    startLoadingRef.current = new Date();
    getClientList();
  }, [getClientList]);

  React.useEffect(() => {
    setDocumentTitle(t("OAuth"));
  }, []);

  return (
    <OAuthContainer>
      {isLoading ? (
        <div>Loading...</div>
      ) : isEmptyClientList ? (
        <OAuthEmptyScreen t={t} />
      ) : (
        <List t={t} clients={clientList} viewAs={viewAs} />
      )}
    </OAuthContainer>
  );
};

export default inject(
  ({ oauthStore, auth }: { oauthStore: OAuthStoreProps; auth: any }) => {
    const { currentDeviceType } = auth.settingsStore;
    const { viewAs, setViewAs, clientList, isEmptyClientList, fetchClients } =
      oauthStore;
    return {
      viewAs,
      setViewAs,
      clientList,
      isEmptyClientList,
      fetchClients,
      currentDeviceType,
    };
  }
)(observer(OAuth));
