import React from "react";
import { StyledInfoPanelHeader } from "./StyledInfoPanelHeaderLoader";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { isDesktop as isDesktopUtils } from "@docspace/shared/utils";

const InfoPanelHeaderLoader = () => {
  const isTablet = !isDesktopUtils();

  return (
    <StyledInfoPanelHeader isTablet={isTablet} withSubmenu={false}>
      <div className="main">
        <RectangleSkeleton
          width={"120px"}
          height={"24px"}
          borderRadius={"3px"}
        />
        {!isTablet && (
          <div className="info-panel-toggle-bg">
            <RectangleSkeleton
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
