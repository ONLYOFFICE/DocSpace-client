import React from "react";

//@ts-ignore
import RectangleLoader from "@docspace/components/skeletons/rectangle";
//@ts-ignore
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";
//@ts-ignore
import Loaders from "@docspace/common/components/Loaders";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

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
        <RectangleLoader
          className="description"
          width={"100%"}
          height={"16px"}
        />
        <RectangleLoader
          className="add-button"
          width={"220px"}
          height={buttonHeight}
        />
        {/* {viewAs === "table" ? <Loaders.TableLoader /> : <Loaders.Rows />} */}
      </StyledContainer>
    </OAuthContainer>
  );
};

export default OAuthLoader;
