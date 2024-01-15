import { Base } from "@docspace/shared/themes";
import { tablet, mobile } from "@docspace/shared/utils";
import { INFO_PANEL_WIDTH } from "@docspace/shared/utils";
import { isMobileOnly, isIOS } from "react-device-detect";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef, useCallback } from "react";
import styled, { css } from "styled-components";
import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import { Portal } from "@docspace/shared/components/portal";
import { DeviceType } from "../../../constants";

const StyledInfoPanelWrapper = styled.div.attrs(({ id }) => ({
  id: id,
}))`
  user-select: none;
  height: auto;
  width: auto;
  background: ${(props) => props.theme.infoPanel.blurColor};
  backdrop-filter: blur(3px);
  z-index: 300;
  @media ${tablet} {
    z-index: 309;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

const StyledInfoPanel = styled.div`
  height: 100%;
  width: ${INFO_PANEL_WIDTH}px;
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          border-right: ${(props) =>
            `1px solid ${props.theme.infoPanel.borderColor}`};
        `
      : css`
          border-left: ${(props) =>
            `1px solid ${props.theme.infoPanel.borderColor}`};
        `}
  display: flex;
  flex-direction: column;

  .scroll-body {
    padding-bottom: 20px;
  }

  @media ${tablet} {
    position: absolute;
    border: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `}
    width: 480px;
    max-width: calc(100vw - 69px);
  }

  @media ${mobile} {
    bottom: 0;
    height: calc(100% - 64px);
    width: 100vw;
    max-width: 100vw;
  }
`;

const StyledControlContainer = styled.div`
  display: none;

  width: 17px;
  height: 17px;
  position: absolute;

  cursor: pointer;

  align-items: center;
  justify-content: center;
  z-index: 450;

  @media ${tablet} {
    display: flex;

    top: 18px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -27px;
          `
        : css`
            left: -27px;
          `}
  }

  @media ${mobile} {
    display: flex;

    top: -27px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 10px;
          `
        : css`
            right: 10px;
          `}
    left: unset;
  }
`;

StyledControlContainer.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossIcon)`
  width: 17px;
  height: 17px;
  z-index: 455;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };

const InfoPanel = ({
  children,
  isVisible,
  isMobileHidden,
  setIsVisible,
  canDisplay,
  anotherDialogOpen,
  viewAs,
  currentDeviceType,
}) => {
  const infoPanelRef = useRef(null);

  const closeInfoPanel = () => setIsVisible(false);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (e.target.id === "InfoPanelWrapper") closeInfoPanel();
    };

    if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
      document.addEventListener("mousedown", onMouseDown);

    window.onpopstate = () => {
      if (currentDeviceType !== DeviceType.desktop && isVisible)
        closeInfoPanel();
    };

    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport.addEventListener("resize", onResize);
    }

    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
    };
  }, []);

  const onResize = useCallback((e) => {
    if (infoPanelRef?.current)
      infoPanelRef.current.style.height = `${e.target.height}px`;
  }, []);

  const infoPanelComponent = (
    <StyledInfoPanelWrapper
      isRowView={viewAs === "row"}
      className="info-panel"
      id="InfoPanelWrapper"
      ref={infoPanelRef}
    >
      <StyledInfoPanel isRowView={viewAs === "row"}>
        <StyledControlContainer
          isRowView={viewAs === "row"}
          onClick={closeInfoPanel}
        >
          <StyledCrossIcon />
        </StyledControlContainer>

        {children}
      </StyledInfoPanel>
    </StyledInfoPanelWrapper>
  );

  const renderPortalInfoPanel = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={infoPanelComponent}
        appendTo={rootElement}
        visible={isVisible && !isMobileHidden && !anotherDialogOpen}
      />
    );
  };

  return !isVisible ||
    !canDisplay ||
    (anotherDialogOpen && currentDeviceType !== DeviceType.desktop) ||
    (currentDeviceType !== DeviceType.desktop && isMobileHidden)
    ? null
    : currentDeviceType === DeviceType.mobile
      ? renderPortalInfoPanel()
      : infoPanelComponent;
};

InfoPanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.any,
  ]),
  isVisible: PropTypes.bool,
};

StyledInfoPanelWrapper.defaultProps = { theme: Base };
StyledInfoPanel.defaultProps = { theme: Base };
InfoPanel.defaultProps = { theme: Base };

export default inject(({ auth, dialogsStore }) => {
  const { isVisible, isMobileHidden, setIsVisible, getCanDisplay } =
    auth.infoPanelStore;

  const { currentDeviceType } = auth.settingsStore;

  const { createRoomDialogVisible, invitePanelOptions } = dialogsStore;

  const canDisplay = getCanDisplay();

  const anotherDialogOpen =
    createRoomDialogVisible || invitePanelOptions.visible;

  return {
    isVisible,
    isMobileHidden,
    setIsVisible,
    canDisplay,
    anotherDialogOpen,
    currentDeviceType,
  };
})(InfoPanel);
