import { isMobileOnly, isIOS } from "react-device-detect";
import { useEffect, useRef, useCallback } from "react";

import { DeviceType } from "../../../enums";
import { Portal } from "../../portal";

import {
  StyledInfoPanelWrapper,
  StyledInfoPanel,
  StyledControlContainer,
  StyledCrossIcon,
} from "../Section.styled";
import { InfoPanelProps } from "../Section.types";

const InfoPanel = ({
  children,
  isVisible,
  isMobileHidden,
  setIsVisible,
  canDisplay,
  anotherDialogOpen,
  viewAs,
  currentDeviceType,
}: InfoPanelProps) => {
  const infoPanelRef = useRef<null | HTMLDivElement>(null);

  const closeInfoPanel = () => setIsVisible?.(false);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.id === "InfoPanelWrapper") setIsVisible?.(false);
    };

    if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
      document.addEventListener("mousedown", onMouseDown);

    window.onpopstate = () => {
      if (currentDeviceType !== DeviceType.desktop && isVisible)
        setIsVisible?.(false);
    };

    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [currentDeviceType, isVisible, setIsVisible, viewAs]);

  const onResize = useCallback((e: Event) => {
    const target = e.target as VisualViewport;
    if (infoPanelRef?.current)
      infoPanelRef.current.style.height = `${target.height}px`;
  }, []);

  useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport?.addEventListener("resize", onResize);
    }

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const infoPanelComponent = (
    <StyledInfoPanelWrapper
      className="info-panel"
      id="InfoPanelWrapper"
      ref={infoPanelRef}
    >
      <StyledInfoPanel>
        <StyledControlContainer onClick={closeInfoPanel}>
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
        appendTo={rootElement || undefined}
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

export default InfoPanel;
