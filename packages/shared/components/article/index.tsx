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

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { isMobile, isMobileOnly, isIOS } from "react-device-detect";

import { DeviceType } from "../../enums";
import { ArticleProfileLoader } from "../../skeletons/article";

import { Portal } from "../portal";
import { Backdrop } from "../backdrop";
import { Scrollbar } from "../scrollbar";

import SubArticleHeader from "./sub-components/Header";
import ArticleProfile from "./sub-components/Profile";
import ArticleLiveChat from "./sub-components/LiveChat";
import ArticleApps from "./sub-components/Apps";
import ArticleDevToolsBar from "./sub-components/DevToolsBar";
import HideArticleMenuButton from "./sub-components/HideMenuButton";
import BackButton from "./sub-components/BackButton";

import styles from "./Article.module.scss";
import { HEADER_NAME, MAIN_BUTTON_NAME, BODY_NAME } from "./Article.constants";
import { ArticleProps } from "./Article.types";

const ArticleHeader = ({ children }: { children: React.ReactNode }) => null;
ArticleHeader.displayName = HEADER_NAME;

const ArticleMainButton = ({ children }: { children?: React.ReactNode }) =>
  null;
ArticleMainButton.displayName = MAIN_BUTTON_NAME;

const ArticleBody = ({ children }: { children: React.ReactNode }) => null;
ArticleBody.displayName = BODY_NAME;

const Article = ({
  showText,
  setShowText,
  articleOpen,
  toggleShowText,
  toggleArticleOpen,
  setIsMobileArticle,
  children,

  withMainButton,
  isInfoPanelVisible,

  hideProfileBlock,
  hideAppsBlock,

  setArticleOpen,
  withSendAgain,
  mainBarVisible,

  isLiveChatAvailable,
  isShowLiveChat,

  onLogoClickAction,

  currentDeviceType,
  showArticleLoader,
  isAdmin,
  withCustomArticleHeader,

  isBurgerLoading,

  isNonProfit,
  isFreeTariff,
  isGracePeriod,
  isLicenseDateExpired,
  isLicenseExpiring,
  isPaymentPageAvailable,
  isTrial,
  standalone,
  currentTariffPlanTitle,
  trialDaysLeft,

  languageBaseName,
  zendeskEmail,
  isMobileArticle,
  chatDisplayName,
  zendeskKey,
  showProgress,
  user,
  getActions,
  onProfileClick,
  logoText,

  limitedAccessDevToolsForUsers,

  downloaddesktopUrl,
  officeforandroidUrl,
  officeforiosUrl,
  showBackButton,
}: ArticleProps) => {
  const [articleHeaderContent, setArticleHeaderContent] =
    React.useState<null | React.JSX.Element>(null);
  const [articleMainButtonContent, setArticleMainButtonContent] =
    React.useState<null | React.JSX.Element>(null);
  const [articleBodyContent, setArticleBodyContent] =
    React.useState<null | React.JSX.Element>(null);
  const [correctTabletHeight, setCorrectTabletHeight] = React.useState<
    null | number
  >(null);
  const updateSizeRef = React.useRef<null | ReturnType<typeof setTimeout>>(
    null,
  );

  const onMobileBack = React.useCallback(() => {
    // close article

    if (currentDeviceType !== DeviceType.mobile) return;
    setArticleOpen(false);
  }, [setArticleOpen, currentDeviceType]);

  React.useEffect(() => {
    window.addEventListener("popstate", onMobileBack);
    return () => window.removeEventListener("popstate", onMobileBack);
  }, [onMobileBack]);

  React.useEffect(() => {
    const item = localStorage.getItem("showArticle") || "{}";

    const showArticle = JSON.parse(item);

    if (currentDeviceType === DeviceType.mobile) {
      setShowText(true);
      setIsMobileArticle(true);

      return;
    }

    if (currentDeviceType === DeviceType.tablet) {
      setIsMobileArticle(true);

      if (showArticle) return;

      setShowText(false);

      return;
    }

    setShowText(true);
    setIsMobileArticle(false);
  }, [setShowText, setIsMobileArticle, currentDeviceType]);

  React.useEffect(() => {
    React.Children.forEach(children, (child) => {
      const childType =
        child && child.type && (child.type.displayName || child.type.name);

      switch (childType) {
        case Article.Header.displayName:
          setArticleHeaderContent(child);
          break;
        case Article.MainButton.displayName:
          setArticleMainButtonContent(child);
          break;
        case Article.Body.displayName:
          setArticleBodyContent(child);
          break;
        default:
          break;
      }
    });
  }, [children]);

  // TODO: make some better
  const onResize = React.useCallback(
    (e?: Event) => {
      let tableHeight = window.innerHeight;

      if (mainBarVisible) {
        const mainBar = document.getElementById("main-bar");

        if (mainBar) {
          if (!mainBar.offsetHeight) {
            updateSizeRef.current = setTimeout(() => onResize(), 0);
            return;
          }

          tableHeight -= mainBar.offsetHeight;
        }
      }

      setCorrectTabletHeight(tableHeight);
    },
    [mainBarVisible],
  );

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    if (isMobile && !isMobileOnly && isIOS) {
      window?.visualViewport?.addEventListener("resize", onResize);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      window?.visualViewport?.removeEventListener("resize", onResize);
      if (updateSizeRef.current) clearTimeout(updateSizeRef.current);
    };
  }, [onResize]);

  const hideDevTools =
    user?.isVisitor ||
    (!user?.isAdmin && limitedAccessDevToolsForUsers) ||
    window.location.pathname.includes("portal-settings") ||
    window.location.pathname.includes("management");

  const pathDevTools = user?.isAdmin
    ? "/portal-settings/developer-tools"
    : "/developer-tools";

  const articleComponent = (
    <>
      <div
        id="article-container"
        data-show-text={showText ? "true" : "false"}
        data-open={articleOpen ? "true" : "false"}
        data-with-main-button={withMainButton ? "true" : "false"}
        className={styles.article}
        data-testid="article"
      >
        <SubArticleHeader
          showText={showText}
          onLogoClickAction={onLogoClickAction}
          currentDeviceType={currentDeviceType}
          withCustomArticleHeader={withCustomArticleHeader}
          isBurgerLoading={isBurgerLoading}
          onIconClick={toggleArticleOpen}
          showBackButton={showBackButton}
        >
          {articleHeaderContent ? articleHeaderContent.props.children : null}
        </SubArticleHeader>

        {articleMainButtonContent &&
        withMainButton &&
        currentDeviceType !== DeviceType.mobile ? (
          <div
            className={styles.articleMainButton}
            data-mobile-article={isMobileArticle ? "true" : "false"}
          >
            {articleMainButtonContent.props.children}
          </div>
        ) : null}

        <Scrollbar
          className="article-body__scrollbar"
          scrollClass="article-scroller"
        >
          {showBackButton && currentDeviceType !== DeviceType.mobile ? (
            <BackButton
              showText={showText}
              currentDeviceType={currentDeviceType}
              onLogoClickAction={onLogoClickAction}
              isLoading={isBurgerLoading}
            />
          ) : null}
          {articleBodyContent ? articleBodyContent.props.children : null}
          {!showArticleLoader ? (
            <>
              {!hideDevTools ? (
                <ArticleDevToolsBar
                  articleOpen={articleOpen}
                  currentDeviceType={currentDeviceType}
                  toggleArticleOpen={toggleArticleOpen}
                  showText={showText}
                  path={pathDevTools}
                />
              ) : null}
              {!hideAppsBlock ? (
                <ArticleApps
                  withDevTools={!hideDevTools}
                  showText={showText}
                  logoText={logoText}
                  downloaddesktopUrl={downloaddesktopUrl}
                  officeforandroidUrl={officeforandroidUrl}
                  officeforiosUrl={officeforiosUrl}
                />
              ) : null}
              {!isMobile && isLiveChatAvailable ? (
                <ArticleLiveChat
                  isInfoPanelVisible={isInfoPanelVisible}
                  withMainButton={
                    withMainButton || false ? !!articleMainButtonContent : false
                  }
                  languageBaseName={languageBaseName}
                  zendeskEmail={zendeskEmail}
                  isMobileArticle={isMobileArticle}
                  chatDisplayName={chatDisplayName}
                  zendeskKey={zendeskKey}
                  showProgress={showProgress}
                  isShowLiveChat={isShowLiveChat}
                />
              ) : null}
            </>
          ) : null}
        </Scrollbar>
        {!showArticleLoader ? (
          <HideArticleMenuButton
            showText={showText}
            toggleShowText={toggleShowText}
            hideProfileBlock={hideProfileBlock}
          />
        ) : null}

        {!hideProfileBlock && currentDeviceType !== DeviceType.mobile ? (
          showArticleLoader ? (
            <ArticleProfileLoader showText={showText} />
          ) : (
            <ArticleProfile
              showText={showText}
              currentDeviceType={currentDeviceType}
              user={user}
              getActions={getActions}
              onProfileClick={onProfileClick}
            />
          )
        ) : null}
      </div>
      {articleOpen && currentDeviceType === DeviceType.mobile ? (
        <Backdrop
          onClick={toggleArticleOpen}
          visible
          zIndex={210}
          withBackground
        />
      ) : null}

      {articleMainButtonContent && currentDeviceType === DeviceType.mobile ? (
        <div
          className={styles.articleMainButton}
          data-mobile-article={isMobileArticle ? "true" : "false"}
        >
          {articleMainButtonContent.props.children}
        </div>
      ) : null}
    </>
  );

  const renderPortalArticle = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={articleComponent}
        appendTo={rootElement || undefined}
        visible
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortalArticle()
    : articleComponent;
};

Article.Header = ArticleHeader;
Article.MainButton = ArticleMainButton;
Article.Body = ArticleBody;

export default Article;
