import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, Outlet } from "react-router-dom";
import { withTranslation } from "react-i18next";

import Article from "@docspace/common/components/Article";
import {
  updateTempContent,
  showLoader,
  hideLoader,
} from "@docspace/common/utils";
import { regDesktop } from "@docspace/common/desktop";

import { toastr } from "@docspace/shared/components/toast";

import FilesPanels from "./components/FilesPanels";
import GlobalEvents from "./components/GlobalEvents";
import {
  ArticleBodyContent,
  ArticleHeaderContent,
  ArticleMainButtonContent,
} from "./components/Article";

const ClientArticle = React.memo(
  ({
    withMainButton,
    setIsHeaderLoading,
    setIsFilterLoading,
    showArticleLoader,
  }) => {
    return (
      <Article
        withMainButton={withMainButton}
        onLogoClickAction={() => {
          setIsFilterLoading(true, false);
          setIsHeaderLoading(true, false);
        }}
        showArticleLoader={showArticleLoader}
      >
        <Article.Header>
          <ArticleHeaderContent />
        </Article.Header>

        <Article.MainButton>
          <ArticleMainButtonContent />
        </Article.MainButton>

        <Article.Body>
          <ArticleBodyContent />
        </Article.Body>
      </Article>
    );
  }
);

const ClientContent = (props) => {
  const {
    loadClientInfo,
    setIsLoaded,
    isAuthenticated,
    user,
    isEncryption,
    encryptionKeys,
    setEncryptionKeys,
    isLoaded,
    isDesktop,
    showMenu,
    isFrame,
    withMainButton,
    t,

    isLoading,
    setIsFilterLoading,
    setIsHeaderLoading,
    isDesktopClientInit,
    setIsDesktopClientInit,
    showArticleLoader,
  } = props;

  const location = useLocation();

  const isEditor = location.pathname.indexOf("doceditor") !== -1;
  const isFormGallery = location.pathname.split("/").includes("form-gallery");

  React.useEffect(() => {
    loadClientInfo()
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsLoaded(true);
        updateTempContent();
      });
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && !isDesktopClientInit && isDesktop && isLoaded) {
      setIsDesktopClientInit(true);
      regDesktop(
        user,
        isEncryption,
        encryptionKeys,
        setEncryptionKeys,
        isEditor,
        null,
        t
      );
      //   console.log(
      //     "%c%s",
      //     "color: green; font: 1.2em bold;",
      //     "Current keys is: ",
      //     encryptionKeys
      //   );
    }
  }, [
    t,
    isAuthenticated,
    user,
    isEncryption,
    encryptionKeys,
    setEncryptionKeys,
    isLoaded,
    isDesktop,
  ]);

  React.useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  return (
    <>
      <FilesPanels />
      <GlobalEvents />
      {!isFormGallery ? (
        isFrame ? (
          showMenu && (
            <ClientArticle
              withMainButton={withMainButton}
              setIsHeaderLoading={setIsHeaderLoading}
              setIsFilterLoading={setIsFilterLoading}
              showArticleLoader={showArticleLoader}
            />
          )
        ) : (
          <ClientArticle
            withMainButton={withMainButton}
            setIsHeaderLoading={setIsHeaderLoading}
            setIsFilterLoading={setIsFilterLoading}
            showArticleLoader={showArticleLoader}
          />
        )
      ) : (
        <></>
      )}
      <Outlet />
    </>
  );
};

const Client = inject(
  ({ auth, clientLoadingStore, filesStore, peopleStore, pluginStore }) => {
    const {
      frameConfig,
      isFrame,
      isDesktopClient,
      encryptionKeys,
      setEncryptionKeys,
      isEncryptionSupport,
      enablePlugins,
      isDesktopClientInit,
      setIsDesktopClientInit,
    } = auth.settingsStore;

    if (!auth.userStore.user) return;

    const { isVisitor } = auth.userStore.user;

    const {
      isLoading,
      setIsSectionFilterLoading,
      setIsSectionHeaderLoading,
      showArticleLoader,
    } = clientLoadingStore;

    const withMainButton = !isVisitor;

    const { isInit: isInitPlugins, initPlugins } = pluginStore;

    return {
      isDesktop: isDesktopClient,
      isDesktopClientInit,
      setIsDesktopClientInit,
      isFrame,
      showMenu: frameConfig?.showMenu,
      user: auth.userStore.user,
      isAuthenticated: auth.isAuthenticated,
      encryptionKeys: encryptionKeys,
      isEncryption: isEncryptionSupport,
      isLoaded: auth.isLoaded && clientLoadingStore.isLoaded,
      setIsLoaded: clientLoadingStore.setIsLoaded,
      withMainButton,
      setIsFilterLoading: setIsSectionFilterLoading,
      setIsHeaderLoading: setIsSectionHeaderLoading,
      isLoading,
      setEncryptionKeys: setEncryptionKeys,
      showArticleLoader,
      loadClientInfo: async () => {
        const actions = [];
        actions.push(filesStore.initFiles());
        actions.push(peopleStore.init());

        if (enablePlugins && !isInitPlugins) actions.push(initPlugins());
        await Promise.all(actions);
      },
    };
  }
)(withTranslation("Common")(observer(ClientContent)));

export default () => <Client />;
