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

import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { isMobile, isMobileOnly } from "react-device-detect";

import { Scrollbar } from "@docspace/shared/components/scrollbar";
import {
  isTablet as isTabletUtils,
  mobileMore,
  tablet,
} from "@docspace/shared/utils";

const StyledContainer = styled.div`
  width: 100%;
  height: 100dvh;

  #customScrollBar {
    z-index: 0;
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

  @media ${mobileMore} {
    #customScrollBar {
      > .scroll-wrapper > .scroller > .scroll-body {
        padding-inline: 0px !important;
      }
    }
  }
`;

const Layout = (props) => {
  const {
    children,
    isTabletView,
    setIsTabletView,
    setWindowWidth,
    setWindowAngle,
    isFrame,
    runOperations,
  } = props;

  const [isPortrait, setIsPortrait] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  window.DocSpace = {
    ...window.DocSpace,
    navigate,
    location,
    runOperations,
  };

  const isSDKPath = window.DocSpace.location.pathname.includes("/old-sdk/");

  let intervalHandler;
  let timeoutHandler;

  const onWidthChange = (e) => {
    const { matches } = e;
    setIsTabletView(matches);
  };

  const onResize = () => {
    setWindowWidth(window.innerWidth);
  };

  const onOrientationChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0;

    setWindowAngle(angle);
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    setIsPortrait(window.innerHeight > window.innerWidth);
  });

  useEffect(() => {
    setIsTabletView(isTabletUtils());

    const mediaQuery = window.matchMedia(tablet);
    mediaQuery.addEventListener("change", onWidthChange);

    return () => {
      mediaQuery.removeEventListener("change", onWidthChange);
      if (intervalHandler) clearInterval(intervalHandler);
      if (timeoutHandler) clearTimeout(timeoutHandler);
    };
  }, [onWidthChange]);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    if (isMobile || isTabletView || !isFrame) {
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener(
          "change",
          onOrientationChange,
        );
      } else {
        window.addEventListener("orientationchange", onOrientationChange);
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.screen?.orientation?.removeEventListener(
        "change",
        onOrientationChange,
      );
    };
  }, [isTabletView, isFrame, onResize, onOrientationChange]);

  useEffect(() => {
    const htmlEl = document.getElementsByTagName("html")[0];
    const bodyEl = document.getElementsByTagName("body")[0];

    htmlEl.style.height = "100dvh";
    bodyEl.style.height = "100dvh";

    htmlEl.style.overflow = "hidden";
  }, []);

  return (
    <StyledContainer className="Layout" isPortrait={isPortrait}>
      {isSDKPath ? (
        children
      ) : (
        <Scrollbar id="customScrollBar">{children}</Scrollbar>
      )}
    </StyledContainer>
  );
};

Layout.propTypes = {
  isTabletView: PropTypes.bool,
  children: PropTypes.any,
  setIsTabletView: PropTypes.func,
};

export default inject(({ settingsStore, filesActionsStore }) => {
  const {
    isTabletView,
    setIsTabletView,
    setWindowWidth,
    setWindowAngle,
    isFrame,
  } = settingsStore;
  const { runOperations } = filesActionsStore;

  return {
    isTabletView,
    setIsTabletView,
    setWindowWidth,
    setWindowAngle,
    isFrame,
    runOperations,
  };
})(observer(Layout));
