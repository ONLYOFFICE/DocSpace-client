import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  StyledGalleryLoader,
  StyledGalleryProperty,
  StyledGallerySubtitleLoader,
} from "../body.styled";
import { propertyGalleryDimensions } from "../body.constant";

const GalleryLoader = () => {
  return (
    <StyledGalleryLoader>
      <RectangleSkeleton
        className="thumbnail"
        width="360.2px"
        height="346px"
        borderRadius="3px"
      />

      <StyledGallerySubtitleLoader>
        <RectangleSkeleton width="71px" height="16px" borderRadius="3px" />
      </StyledGallerySubtitleLoader>

      <StyledGalleryProperty>
        {propertyGalleryDimensions.map((property) => [
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
      </StyledGalleryProperty>
    </StyledGalleryLoader>
  );
};

export default GalleryLoader;
