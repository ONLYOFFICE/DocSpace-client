import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { TableSkeleton } from "@docspace/shared/skeletons/table";
import { RowsSkeleton } from "@docspace/shared/skeletons/rows";
import { DeviceType } from "@docspace/shared/enums";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";

import { OAuthContainer } from "../../OAuth.styled";
import { StyledContainer } from "./List.styled";

const OAuthLoader = ({
  viewAs,
  currentDeviceType,
}: {
  viewAs: ViewAsType;
  currentDeviceType: DeviceType;
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
