import React from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { isMobile, isMobileOnly, isIOS } from "react-device-detect";

import SubArticleBackdrop from "./sub-components/article-backdrop";
import SubArticleHeader from "./sub-components/article-header";
import SubArticleMainButton from "./sub-components/article-main-button";
import SubArticleBody from "./sub-components/article-body";
import ArticleProfile from "./sub-components/article-profile";
import ArticleAlerts from "./sub-components/article-alerts";
import ArticleLiveChat from "./sub-components/article-live-chat";
import ArticleApps from "./sub-components/article-apps";
import { StyledArticle } from "./styled-article";
import HideArticleMenuButton from "./sub-components/article-hide-menu-button";
import Portal from "@docspace/components/portal";
import { DeviceType } from "../../constants";

const Article = ({
  showText,
  setShowText,
  articleOpen,
  toggleShowText,
  toggleArticleOpen,
  setIsMobileArticle,
  children,

  withMainButton,

  hideProfileBlock,

  currentColorScheme,
  setArticleOpen,
  withSendAgain,
  mainBarVisible,
  isBannerVisible,

  isLiveChatAvailable,

  onLogoClickAction,
  theme,

  currentDeviceType,
  ...rest
}) => {
  const [articleHeaderContent, setArticleHeaderContent] = React.useState(null);
  const [articleMainButtonContent, setArticleMainButtonContent] =
    React.useState(null);
  const [articleBodyContent, setArticleBodyContent] = React.useState(null);
  const [correctTabletHeight, setCorrectTabletHeight] = React.useState(null);

  React.useEffect(() => {
    window.addEventListener("popstate", onMobileBack);
    return () => window.removeEventListener("popstate", onMobileBack);
  }, [onMobileBack]);

  React.useEffect(() => {
    // const showArticle = JSON.parse(localStorage.getItem("showArticle"));

    if (currentDeviceType === DeviceType.mobile) {
      setShowText(true);
      setIsMobileArticle(true);

      return;
    }

    if (currentDeviceType === DeviceType.tablet) {
      setIsMobileArticle(true);

      // if (showArticle) return;

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

  const onMobileBack = React.useCallback(() => {
    //close article

    if (currentDeviceType !== DeviceType.mobile) return;
    setArticleOpen(false);
  }, [setArticleOpen, currentDeviceType]);

  // TODO: make some better
  const onResize = React.useCallback(
    (e) => {
      let correctTabletHeight = window.innerHeight;

      if (mainBarVisible) correctTabletHeight -= 64;

      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      const path = window.location.pathname.toLowerCase();

      if (
        isBannerVisible &&
        isMobile &&
        isTouchDevice &&
        (path.includes("rooms") || path.includes("files"))
      ) {
        correctTabletHeight -= 80;

        if (e?.target?.height) {
          const diff = window.innerHeight - e.target.height;

          correctTabletHeight -= diff;
        }
      }

      setCorrectTabletHeight(correctTabletHeight);
    },
    [mainBarVisible, isBannerVisible]
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
    };
  }, [onResize]);

  const articleComponent = (
    <>
      <StyledArticle
        id={"article-container"}
        showText={showText}
        articleOpen={articleOpen}
        $withMainButton={withMainButton}
        correctTabletHeight={correctTabletHeight}
        isMobile={currentDeviceType === DeviceType.mobile}
        {...rest}
      >
        <SubArticleHeader
          showText={showText}
          onLogoClickAction={onLogoClickAction}
          currentDeviceType={currentDeviceType}
        >
          {articleHeaderContent ? articleHeaderContent.props.children : null}
        </SubArticleHeader>

        {articleMainButtonContent &&
        withMainButton &&
        currentDeviceType !== DeviceType.mobile ? (
          <SubArticleMainButton showText={showText}>
            {articleMainButtonContent.props.children}
          </SubArticleMainButton>
        ) : null}

        <SubArticleBody showText={showText}>
          {articleBodyContent ? articleBodyContent.props.children : null}
          <ArticleAlerts />
          <ArticleApps showText={showText} theme={theme} />
          {!isMobile && isLiveChatAvailable && (
            <ArticleLiveChat
              currentColorScheme={currentColorScheme}
              withMainButton={withMainButton && !!articleMainButtonContent}
            />
          )}
        </SubArticleBody>

        <HideArticleMenuButton
          showText={showText}
          toggleShowText={toggleShowText}
          currentColorScheme={currentColorScheme}
        />
        {!hideProfileBlock && currentDeviceType !== DeviceType.mobile && (
          <ArticleProfile
            showText={showText}
            currentDeviceType={currentDeviceType}
          />
        )}
      </StyledArticle>
      {articleOpen && currentDeviceType === DeviceType.mobile && (
        <>
          <SubArticleBackdrop onClick={toggleArticleOpen} />
        </>
      )}

      {articleMainButtonContent && currentDeviceType === DeviceType.mobile ? (
        <SubArticleMainButton showText={showText}>
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
        appendTo={rootElement}
        visible={true}
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

Article.propTypes = {
  showText: PropTypes.bool,
  setShowText: PropTypes.func,
  articleOpen: PropTypes.bool,
  toggleArticleOpen: PropTypes.func,
  setIsMobileArticle: PropTypes.func,
  children: PropTypes.any,
  hideProfileBlock: PropTypes.bool,
};

Article.Header = () => {
  return null;
};
Article.Header.displayName = "Header";

Article.MainButton = () => {
  return null;
};
Article.MainButton.displayName = "MainButton";

Article.Body = () => {
  return null;
};
Article.Body.displayName = "Body";

export default inject(({ auth }) => {
  const { settingsStore, userStore, isLiveChatAvailable, bannerStore } = auth;

  const { withSendAgain } = userStore;

  const { isBannerVisible } = bannerStore;

  const {
    showText,
    setShowText,
    articleOpen,
    setIsMobileArticle,
    toggleShowText,
    toggleArticleOpen,
    currentColorScheme,
    setArticleOpen,
    mainBarVisible,
    theme,
    currentDeviceType,
  } = settingsStore;

  return {
    showText,
    setShowText,
    articleOpen,
    setIsMobileArticle,
    toggleShowText,
    toggleArticleOpen,

    currentColorScheme,
    setArticleOpen,
    withSendAgain,
    mainBarVisible,
    isBannerVisible,

    isLiveChatAvailable,

    theme,
    currentDeviceType,
  };
})(observer(Article));
