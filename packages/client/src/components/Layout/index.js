import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import MobileLayout from "./MobileLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  size as deviceSize,
  isTablet as isTabletUtils,
  isMobile as isMobileUtils,
  tablet,
} from "@docspace/components/utils/device";
import {
  isIOS,
  isFirefox,
  isSafari,
  isMobile,
  isMobileOnly,
  isChrome,
  isTablet,
  isAndroid,
} from "react-device-detect";
import { inject, observer } from "mobx-react";

const StyledContainer = styled.div`
  user-select: none;
  width: 100%;

  height: ${(props) =>
    isMobile && isIOS ? "calc(var(--vh, 1vh) * 100)" : props.contentHeight};

  #customScrollBar {
    z-index: 0;
    > .scroll-wrapper > .scroller > .scroll-body {
      -webkit-user-select: none;
    }
  }
`;

const Layout = (props) => {
  const { children, isTabletView, setIsTabletView, setWindowWidth } = props;

  const [contentHeight, setContentHeight] = useState();
  const [isPortrait, setIsPortrait] = useState();

  if (window.DocSpace) {
    window.DocSpace.navigate = useNavigate();
    window.DocSpace.location = useLocation();
  } else {
    window.DocSpace = { navigate: useNavigate(), location: useLocation() };
  }

  const intervalTime = 100;
  const endTimeout = 300;
  let intervalHandler;
  let timeoutHandler;

  useEffect(() => {
    setIsPortrait(window.innerHeight > window.innerWidth);
  });
  useEffect(() => {
    setIsTabletView(isTabletUtils());

    let mediaQuery = window.matchMedia(tablet);
    mediaQuery.addEventListener("change", onWidthChange);

    return () => {
      mediaQuery.removeEventListener("change", onWidthChange);
      if (intervalHandler) clearInterval(intervalHandler);
      if (timeoutHandler) clearTimeout(timeoutHandler);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    if (isTabletUtils() || isMobileUtils()) {
      window.addEventListener("orientationchange", onOrientationChange);

      if (isMobile) {
        window?.visualViewport?.addEventListener("resize", onOrientationChange);
        window?.visualViewport?.addEventListener("scroll", onScroll);
        window.addEventListener("scroll", onScroll);
      }

      changeRootHeight();
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      window?.visualViewport?.removeEventListener(
        "resize",
        onOrientationChange
      );
      window.removeEventListener("scroll", onScroll);
    };
  }, [isTabletView]);

  useEffect(() => {
    const htmlEl = document.getElementsByTagName("html")[0];
    const bodyEl = document.getElementsByTagName("body")[0];

    htmlEl.style.height = bodyEl.style.height = "100%";
    htmlEl.style.overflow = "hidden";
  }, []);

  const onWidthChange = (e) => {
    const { matches } = e;

    setIsTabletView(matches);
  };

  const onScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo(0, 0);
  };

  const onResize = () => {
    changeRootHeight();
    setWindowWidth(window.innerWidth);
  };
  const onOrientationChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setWindowWidth(window.innerWidth);
    changeRootHeight(e);
  };
  const changeRootHeight = (e) => {
    intervalHandler && clearInterval(intervalHandler);
    timeoutHandler && clearTimeout(timeoutHandler);

    let lastInnerHeight, noChangeCount;

    const updateHeight = () => {
      const correctorMobileChrome = 57; // ios
      //const correctorTabletSafari = 71; // ios

      clearInterval(intervalHandler);
      clearTimeout(timeoutHandler);

      intervalHandler = null;
      timeoutHandler = null;

      let height = "100vh";
      let windowHeight = window.innerHeight;

      if (isMobileUtils() && isIOS && isChrome) {
        if (window.innerHeight < window.innerWidth && isPortrait) {
          height = window.screen.availWidth - correctorMobileChrome + "px";
        }
      }

      if (isMobileUtils() && isAndroid && isChrome) {
        height = `100%`;
      }

      if (isIOS && isMobile && e?.type === "resize" && e?.target?.height) {
        const diff = window.innerHeight - e.target.height;

        windowHeight -= diff;

        document.body.style.height = `${e.target.height + e.target.offsetTop}`;
        document.body.style.maxHeight = `${
          e.target.height + e.target.offsetTop
        }`;
        document.body.style.minHeight = `${
          e.target.height + e.target.offsetTop
        }`;

        document.body.style.top = `0px`;
        document.body.style.position = `fixed`;
        document.body.style.overflow = `hidden`;
        document.body.style.scroll = `hidden`;
      } else if (isMobile && isIOS) {
        document.body.style.height = `100%`;
        document.body.style.maxHeight = `100%`;
        document.body.style.minHeight = `100%`;
        document.body.style.removeProperty("bottom");
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("overflow");
      }

      if (isMobile && !isIOS) {
        const root = document.getElementById("root");

        root.style.height = `100%`;
        root.style.maxHeight = `100%`;
        root.style.minHeight = `100%`;
      }

      let vh = windowHeight * 0.01;

      document.documentElement.style.setProperty("--vh", `${vh}px`);

      setContentHeight(height);
    };
    intervalHandler = setInterval(() => {
      //console.log("changeRootHeight setInterval"); TODO: need to refactoring
      if (window.innerHeight === lastInnerHeight) {
        noChangeCount++;

        if (noChangeCount === intervalTime) {
          updateHeight();
        }
      } else {
        lastInnerHeight = window.innerHeight;
        noChangeCount = 0;
      }
    });

    timeoutHandler = setTimeout(() => {
      updateHeight();
    }, endTimeout);
  };

  return (
    <StyledContainer
      className="Layout"
      isTabletView={isTabletUtils()}
      contentHeight={contentHeight}
    >
      {isMobileUtils() ? <MobileLayout {...props} /> : children}
    </StyledContainer>
  );
};

Layout.propTypes = {
  isTabletView: PropTypes.bool,
  children: PropTypes.any,
  setIsTabletView: PropTypes.func,
};

export default inject(({ auth, bannerStore }) => {
  return {
    isTabletView: auth.settingsStore.isTabletView,
    setIsTabletView: auth.settingsStore.setIsTabletView,
    setWindowWidth: auth.settingsStore.setWindowWidth,
  };
})(observer(Layout));
