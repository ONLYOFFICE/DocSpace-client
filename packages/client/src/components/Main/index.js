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
    [mainBarVisible, isBannerVisible, isFrame]
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
