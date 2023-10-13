import React from "react";
import { StyledInfoPanelHeader } from "./StyledInfoPanelHeaderLoader";
import RectangleLoader from "../RectangleLoader";

import { isDesktop as isDesktopUtils } from "@docspace/components/utils/device";

const InfoPanelHeaderLoader = () => {
  const isTablet = !isDesktopUtils();

  return (
    <StyledInfoPanelHeader isTablet={isTablet} withSubmenu={false}>
      <div className="main">
        <RectangleLoader width={"120px"} height={"24px"} borderRadius={"3px"} />
        {!isTablet && (
          <div className="info-panel-toggle-bg">
            <RectangleLoader
              width={"32px"}
              height={"32px"}
              borderRadius={"50%"}
            />
          </div>
        )}
      </div>
    </StyledInfoPanelHeader>
  );
};

export default InfoPanelHeaderLoader;
