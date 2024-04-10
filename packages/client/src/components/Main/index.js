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

import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { isMobile, isIOS, isFirefox } from "react-device-detect";

import { mobile, isMobile as isMobileUtils } from "@docspace/shared/utils";

const StyledMain = styled.main`
  height: ${(props) => props.mainHeight && `${props.mainHeight}px`};
  width: 100vw;
  z-index: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .main-container {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: row;
    box-sizing: border-box;
  }

  /** @media ${mobile} {
    height: ${isIOS && !isFirefox
    ? "calc(var(--vh, 1vh) * 100)"
    : "calc(100vh - 64px)"};
  } */
`;

const Main = (props) => {
  const { mainBarVisible, isBannerVisible, isFrame } = props;
  //console.log("Main render");
  const [mainHeight, setMainHeight] = React.useState(window.innerHeight);
  const updateSizeRef = React.useRef(null);

  React.useEffect(() => {
    window.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("resize", onResize);

    return () => {
      window.addEventListener("resize", onResize);
      window.visualViewport.removeEventListener("resize", onResize);
      clearTimeout(updateSizeRef.current);
    };
  }, [onResize, isFrame]);

  React.useEffect(() => {
    onResize();
  }, [mainBarVisible, isBannerVisible, isFrame]);

  const onResize = React.useCallback(
    (e) => {
      let correctHeight = window.innerHeight;

      if (mainBarVisible && isMobileUtils()) {
        const mainBar = document.getElementById("main-bar");

        if (!mainBar.offsetHeight)
          return (updateSizeRef.current = setTimeout(() => onResize(), 0));

        correctHeight -= mainBar.offsetHeight;
      }

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
        correctHeight -= 80;

        if (e?.target?.height) {
          const diff = window.innerHeight - e.target.height;

          correctHeight -= diff;
        }
      }

      // 48 - its nav menu with burger, logo and user avatar
      if (isMobileUtils() && !isFrame) {
        correctHeight -= 48;
      }

      setMainHeight(correctHeight);
    },
    [mainBarVisible, isBannerVisible, isFrame],
  );

  return <StyledMain className="main" mainHeight={mainHeight} {...props} />;
};

Main.displayName = "Main";

export default inject(({ settingsStore, bannerStore }) => {
  const { isBannerVisible } = bannerStore;

  const { mainBarVisible, isFrame } = settingsStore;
  return {
    mainBarVisible,
    isBannerVisible,
    isFrame,
  };
})(observer(Main));
