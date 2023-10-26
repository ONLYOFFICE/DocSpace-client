import React from "react";
import Loaders from "@docspace/common/components/Loaders";
import {StyledLoader} from "../StyledSpaces";

type TSpacesLoader = {
  isConfigurationSection: boolean;
}

export const SpacesLoader = ({isConfigurationSection}: TSpacesLoader): JSX.Element => {
  return (
    <StyledLoader>
      <Loaders.Rectangle height="22px" className="subheader" />
      {isConfigurationSection ? (
        <>
          <Loaders.Rectangle height="22px" className="configuration-header" />
          <Loaders.Rectangle height="48px" className="section-title" />
          <Loaders.Rectangle height="52px" className="configuration-input" />
          <Loaders.Rectangle height="52px" className="configuration-input" />
        </>
      ) : (
        <>
          <Loaders.Rectangle height="23px" className="button" />
          <Loaders.Rectangle height="160px" className="portals" />
          <Loaders.Rectangle height="22px" className="domain-header" />
          <Loaders.Rectangle height="52px" className="input" />
        </>
      )}

      <Loaders.Rectangle height="22px" className="button" />
    </StyledLoader>
  );
};
