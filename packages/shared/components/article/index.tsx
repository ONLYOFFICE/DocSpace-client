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

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { isMobile, isMobileOnly, isIOS } from "react-device-detect";

import { DeviceType } from "../../enums";

import { ArticleProfileLoader } from "../../skeletons/article";

import SubArticleBackdrop from "./sub-components/Backdrop";
import SubArticleHeader from "./sub-components/Header";
import SubArticleMainButton from "./sub-components/MainButton";
import SubArticleBody from "./sub-components/Body";
import ArticleProfile from "./sub-components/Profile";
import ArticleLiveChat from "./sub-components/LiveChat";
import ArticleApps from "./sub-components/Apps";
import ArticleDevToolsBar from "./sub-components/DevToolsBar";
import HideArticleMenuButton from "./sub-components/HideMenuButton";
import { Portal } from "../portal";

import { StyledArticle } from "./Article.styled";
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

  currentColorScheme,
  setArticleOpen,
  withSendAgain,
  mainBarVisible,
  isBannerVisible,

  isLiveChatAvailable,
  isShowLiveChat,

  onLogoClickAction,

  currentDeviceType,
  showArticleLoader,
  isAdmin,
  withCustomArticleHeader,

  onArticleHeaderClick,
  isBurgerLoading,

  isNonProfit,
  isEnterprise,
  isFreeTariff,
  isGracePeriod,
  isLicenseDateExpired,
  isLicenseExpiring,
  isPaymentPageAvailable,
  isTrial,
  standalone,
  currentTariffPlanTitle,
  trialDaysLeft,
  paymentDate,

  languageBaseName,
  zendeskEmail,
  isMobileArticle,
  chatDisplayName,
  zendeskKey,
  showProgress,

  user,
  getActions,
  onProfileClick,

  ...rest
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

      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      // navigator.maxTouchPoints > 0;

      const path = window.location.pathname.toLowerCase();

      if (
        isBannerVisible &&
        isMobile &&
        isTouchDevice &&
        (path.includes("rooms") || path.includes("files"))
      ) {
        tableHeight -= 80;

        const target = e?.target as VisualViewport;

        if (target?.height) {
          const diff = window.innerHeight - target.height;
          tableHeight -= diff;
        }
      }

      setCorrectTabletHeight(tableHeight);
    },
    [mainBarVisible, isBannerVisible],
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

  const withDevTools =
    !window.location.pathname.includes("portal-settings") &&
    !window.location.pathname.includes("management") &&
    isAdmin;

  const articleComponent = (
    <>
      <StyledArticle
        id="article-container"
        showText={showText}
        articleOpen={articleOpen}
        $withMainButton={withMainButton}
        isMobile={currentDeviceType === DeviceType.mobile}
        {...rest}
      >
        <SubArticleHeader
          showText={showText}
          onLogoClickAction={onLogoClickAction}
          currentDeviceType={currentDeviceType}
          withCustomArticleHeader={withCustomArticleHeader}
          onClick={onArticleHeaderClick}
          isBurgerLoading={isBurgerLoading}
        >
          {articleHeaderContent ? articleHeaderContent.props.children : null}
        </SubArticleHeader>

        {articleMainButtonContent &&
        withMainButton &&
        currentDeviceType !== DeviceType.mobile ? (
          <SubArticleMainButton>
            {articleMainButtonContent.props.children}
          </SubArticleMainButton>
        ) : null}

        <SubArticleBody>
          {articleBodyContent ? articleBodyContent.props.children : null}
          {!showArticleLoader && (
            <>
              {withDevTools && (
                <ArticleDevToolsBar
                  articleOpen={articleOpen}
                  currentDeviceType={currentDeviceType}
                  toggleArticleOpen={toggleArticleOpen}
                  showText={showText}
                />
              )}
              {!hideAppsBlock && (
                <ArticleApps withDevTools={withDevTools} showText={showText} />
              )}
              {!isMobile && isLiveChatAvailable && (
                <ArticleLiveChat
                  currentColorScheme={currentColorScheme}
                  isInfoPanelVisible={isInfoPanelVisible}
                  withMainButton={
                    (withMainButton || false) && !!articleMainButtonContent
                  }
                  languageBaseName={languageBaseName}
                  email={zendeskEmail}
                  isMobileArticle={isMobileArticle}
                  displayName={chatDisplayName}
                  zendeskKey={zendeskKey}
                  showProgress={showProgress}
                  isShowLiveChat={isShowLiveChat}
                />
              )}
            </>
          )}
        </SubArticleBody>
        {!showArticleLoader && (
          <HideArticleMenuButton
            showText={showText}
            toggleShowText={toggleShowText}
            currentColorScheme={currentColorScheme}
            hideProfileBlock={hideProfileBlock}
          />
        )}

        {!hideProfileBlock &&
          currentDeviceType !== DeviceType.mobile &&
          (showArticleLoader ? (
            <ArticleProfileLoader showText={showText} />
          ) : (
            <ArticleProfile
              showText={showText}
              currentDeviceType={currentDeviceType}
              user={user}
              getActions={getActions}
              onProfileClick={onProfileClick}
            />
          ))}
      </StyledArticle>
      {articleOpen && currentDeviceType === DeviceType.mobile && (
        <SubArticleBackdrop onClick={toggleArticleOpen} />
      )}

      {articleMainButtonContent && currentDeviceType === DeviceType.mobile ? (
        <SubArticleMainButton>
          {articleMainButtonContent.props.children}
        </SubArticleMainButton>
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

  // console.log("Article render", {
  //   articleMainButton: !!articleMainButtonContent,
  //   withMainButton,
  // });

  return currentDeviceType === DeviceType.mobile
    ? renderPortalArticle()
    : articleComponent;
};

Article.Header = ArticleHeader;
Article.MainButton = ArticleMainButton;
Article.Body = ArticleBody;

export default Article;
