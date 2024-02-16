import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  StyledDetailsLoader,
  StyledDetailsProperty,
  StyledDetailsSubtitleLoader,
} from "../body.styled";
import { propertyDetailsDimensions } from "../body.constant";

const DetailsLoader = () => {
  return (
    <StyledDetailsLoader>
      <StyledDetailsSubtitleLoader>
        <RectangleSkeleton width="71px" height="16px" borderRadius="3px" />
      </StyledDetailsSubtitleLoader>

      <StyledDetailsProperty>
        {propertyDetailsDimensions.map((property) => [
          <RectangleSkeleton
            key={property.propertyTitle}
            className="property-title"
            width={property.propertyTitle}
            height="20px"
            borderRadius="3px"
          />,
          <RectangleSkeleton
            key={property.propertyContent}
            className="property-content"
            width={property.propertyContent}
            height="20px"
            borderRadius="3px"
          />,
        ])}
      </StyledDetailsProperty>
    </StyledDetailsLoader>
  );
};

export default DetailsLoader;
