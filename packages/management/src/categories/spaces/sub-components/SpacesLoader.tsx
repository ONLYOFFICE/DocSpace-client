import React from "react";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import { StyledLoader } from "../StyledSpaces";

type TSpacesLoader = {
  isConfigurationSection: boolean;
};

export const SpacesLoader = ({
  isConfigurationSection,
}: TSpacesLoader): JSX.Element => {
  return (
    <StyledLoader>
      <RectangleSkeleton height="22px" className="subheader" />
      {isConfigurationSection ? (
        <>
          <RectangleSkeleton height="22px" className="configuration-header" />
          <RectangleSkeleton height="48px" className="section-title" />
          <RectangleSkeleton height="52px" className="configuration-input" />
          <RectangleSkeleton height="52px" className="configuration-input" />
        </>
      ) : (
        <>
          <RectangleSkeleton height="23px" className="button" />
          <RectangleSkeleton height="160px" className="portals" />
          <RectangleSkeleton height="22px" className="domain-header" />
          <RectangleSkeleton height="52px" className="input" />
        </>
      )}

      <RectangleSkeleton height="22px" className="button" />
    </StyledLoader>
  );
};
