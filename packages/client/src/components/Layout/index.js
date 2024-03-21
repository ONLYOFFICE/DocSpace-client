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
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import MobileLayout from "./MobileLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  isTablet as isTabletUtils,
  isMobile as isMobileUtils,
  tablet,
} from "@docspace/shared/utils";
import {
  isIOS,
  isMobile,
  isChrome,
  isMobileOnly,
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

  ${(props) =>
    isMobileOnly &&
    !props.isPortrait &&
    css`
      display: flex;
      width: auto;
      padding: env(safe-area-inset-top) env(safe-area-inset-right)
        env(safe-area-inset-bottom) env(safe-area-inset-left);
    `}
`;

const Layout = (props) => {
  const { children, isTabletView, setIsTabletView, setWindowWidth, isFrame } =
    props;

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

    if (isMobile || isTabletView || !isFrame) {
      window.addEventListener("orientationchange", onOrientationChange);

      if (isMobileOnly) {
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
        onOrientationChange,
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
    if (window.innerHeight < window.innerWidth) return;

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

      if (isIOS && isMobileOnly && e?.type === "resize" && e?.target?.height) {
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
      } else if (isMobileOnly && isIOS) {
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
      contentHeight={contentHeight}
      isPortrait={isPortrait}
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

export default inject(({ settingsStore }) => {
  const { isTabletView, setIsTabletView, setWindowWidth, isFrame } =
    settingsStore;
  return {
    isTabletView,
    setIsTabletView,
    setWindowWidth,
    isFrame,
  };
})(observer(Layout));
