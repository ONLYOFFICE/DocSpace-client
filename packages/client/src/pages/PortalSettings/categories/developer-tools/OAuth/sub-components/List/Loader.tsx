import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { TableSkeleton } from "@docspace/shared/skeletons/table";
import { RowsSkeleton } from "@docspace/shared/skeletons/rows";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

import { OAuthContainer } from "../../StyledOAuth";
import { StyledContainer } from ".";

const OAuthLoader = ({
  viewAs,
  currentDeviceType,
}: {
  viewAs: ViewAsType;
  currentDeviceType: DeviceUnionType;
}) => {
  const buttonHeight = currentDeviceType !== "desktop" ? "40px" : "32px";

  return (
    <OAuthContainer>
      <StyledContainer>
        <RectangleSkeleton className="description" width="100%" height="16px" />
        <RectangleSkeleton
          className="add-button"
          width="220px"
          height={buttonHeight}
        />
        {viewAs === "table" ? (
          <TableSkeleton style={{}} />
        ) : (
          <RowsSkeleton style={{}} />
        )}
      </StyledContainer>
    </OAuthContainer>
  );
};

export default OAuthLoader;
