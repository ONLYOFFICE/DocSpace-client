/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, Outlet } from "react-router";
import { withTranslation } from "react-i18next";

import Article from "@docspace/ui-kit/components/article";
import { updateTempContent } from "@docspace/shared/utils/common";
import { regDesktop } from "@docspace/shared/utils/desktop";

import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType } from "@docspace/shared/enums";

import FilesPanels from "./components/FilesPanels";
import GlobalEvents from "./components/GlobalEvents";
import {
  ArticleBodyContent,
  ArticleHeaderContent,
  ArticleMainButtonContent,
} from "./components/Article";
import ArticleWrapper from "./components/ArticleWrapper";

const ClientArticle = React.memo(
  ({
    withMainButton,
    showArticleLoader,
    isInfoPanelVisible,
    isAccountsArticle,
    isDeveloperToolsArticle,
  }) => {
    return (
      <ArticleWrapper
        isInfoPanelVisible={isInfoPanelVisible}
        withMainButton={withMainButton}
        showArticleLoader={showArticleLoader && !isDeveloperToolsArticle}
        showBackButton={isAccountsArticle || isDeveloperToolsArticle}
      >
        <Article.Header>
          <ArticleHeaderContent />
        </Article.Header>

        <Article.MainButton>
          <ArticleMainButtonContent />
        </Article.MainButton>

        <Article.Body>
          <ArticleBodyContent
            isAccountsArticle={isAccountsArticle}
            isDeveloperToolsArticle={isDeveloperToolsArticle}
          />
        </Article.Body>
      </ArticleWrapper>
    );
  },
);

ClientArticle.displayName = "ClientArticle";

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
    isInfoPanelVisible,
    t,

    setIsFilterLoading,
    setIsHeaderLoading,
    isDesktopClientInit,
    setIsDesktopClientInit,
    showArticleLoader,

    currentDeviceType,
  } = props;

  const location = useLocation();

  const isEditor = location.pathname.indexOf("doceditor") !== -1;

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
        t,
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

  // React.useEffect(() => {
  //   if (isLoading) {
  //     showLoader();
  //   } else {
  //     hideLoader();
  //   }
  // }, [isLoading]);

  const isAccountsArticle =
    location.pathname.includes("/accounts") ||
    (location.pathname.includes("/profile") &&
      location.state?.fromUrl?.includes("/accounts"));
  const isDeveloperToolsArticle =
    location.pathname.includes("/developer-tools");
  const withMainButton =
    isAccountsArticle || isDeveloperToolsArticle
      ? currentDeviceType !== DeviceType.desktop
      : true;

  return (
    <>
      <FilesPanels />
      <GlobalEvents />
      {isFrame ? (
        showMenu && (
          <ClientArticle
            isInfoPanelVisible={isInfoPanelVisible}
            withMainButton={withMainButton}
            setIsHeaderLoading={setIsHeaderLoading}
            setIsFilterLoading={setIsFilterLoading}
            showArticleLoader={showArticleLoader}
            isAccountsArticle={isAccountsArticle}
            isDeveloperToolsArticle={isDeveloperToolsArticle}
          />
        )
      ) : (
        <ClientArticle
          isInfoPanelVisible={isInfoPanelVisible}
          withMainButton={withMainButton}
          setIsHeaderLoading={setIsHeaderLoading}
          setIsFilterLoading={setIsFilterLoading}
          showArticleLoader={showArticleLoader}
          isAccountsArticle={isAccountsArticle}
          isDeveloperToolsArticle={isDeveloperToolsArticle}
        />
      )}
      <Outlet />
    </>
  );
};

export const Client = inject(
  ({
    authStore,
    clientLoadingStore,
    filesStore,
    pluginStore,
    userStore,
    settingsStore,
    infoPanelStore,
  }) => {
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
      currentDeviceType,
    } = settingsStore;

    if (!userStore.user) return;

    // const { isVisitor } = userStore.user;

    const {
      isLoading,
      setIsSectionFilterLoading,
      setIsSectionHeaderLoading,
      showArticleLoader,
    } = clientLoadingStore;

    const { isInit: isInitPlugins, initPlugins } = pluginStore;

    const { isVisible } = infoPanelStore;
    const isProfile = window.location.pathname.includes("/profile");

    return {
      isDesktop: isDesktopClient,
      isDesktopClientInit,
      setIsDesktopClientInit,
      isFrame,
      showMenu: frameConfig?.showMenu,
      user: userStore.user,
      isAuthenticated: authStore.isAuthenticated,
      encryptionKeys,
      isEncryption: isEncryptionSupport,
      isLoaded: authStore.isLoaded && clientLoadingStore.isLoaded,
      setIsLoaded: clientLoadingStore.setIsLoaded,
      isInfoPanelVisible: isVisible && !isProfile,
      setIsFilterLoading: setIsSectionFilterLoading,
      setIsHeaderLoading: setIsSectionHeaderLoading,
      isLoading,
      setEncryptionKeys,
      showArticleLoader,
      loadClientInfo: async () => {
        const actions = [];
        actions.push(filesStore.initFiles());

        if (enablePlugins && !isInitPlugins) actions.push(initPlugins());
        await Promise.all(actions);
      },
      currentDeviceType,
    };
  },
)(withTranslation("Common")(observer(ClientContent)));
