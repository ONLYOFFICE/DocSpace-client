import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  StyledAccountsLoader,
  StyledProperty,
  StyledSubtitleLoader,
} from "../body.styled";
import { propertyDimensions } from "../body.constant";

const AccountsLoader = () => {
  return (
    <StyledAccountsLoader>
      <StyledSubtitleLoader>
        <RectangleSkeleton width="71px" height="16px" borderRadius="3px" />
      </StyledSubtitleLoader>

      <StyledProperty>
        {propertyDimensions.map((property) => [
          <RectangleSkeleton
            key={property.titleKey}
            className="property-title"
            width={property.propertyTitle}
            height="20px"
            borderRadius="3px"
          />,
          <RectangleSkeleton
            key={property.contentKey}
            className="property-content"
            width={property.propertyContent}
            height="20px"
            borderRadius="3px"
          />,
        ])}
      </StyledProperty>
    </StyledAccountsLoader>
  );
};

export default AccountsLoader;
