import React from "react";
import { ReactSVG } from "react-svg";
import { useTheme } from "styled-components";

import { classNames, getLogoFromPath } from "@docspace/shared/utils";

import { StyledWrapper } from "./DocspaceLogo.styled";
import type { DocspaceLogoProps } from "./DocspaceLogo.types";

const DocspaceLogo = ({ className, whiteLabelLogoUrls }: DocspaceLogoProps) => {
  const theme = useTheme();

  const logo = getLogoFromPath(
    theme.isBase
      ? whiteLabelLogoUrls[1]?.path?.light
      : whiteLabelLogoUrls[1]?.path?.dark,
  );

  return (
    <StyledWrapper>
      {logo && (
        <ReactSVG
          src={logo}
          className={classNames("logo-wrapper", className)}
        />
      )}
    </StyledWrapper>
  );
};

export default DocspaceLogo;
