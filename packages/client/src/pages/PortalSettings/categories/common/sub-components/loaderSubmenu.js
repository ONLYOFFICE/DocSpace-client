import React from "react";
import styled, { css } from "styled-components";
import Loaders from "@docspace/common/components/Loaders";
import { mobileMore } from "@docspace/components/utils/device";

const StyledLoader = styled.div`
  margin-top: -4px;

  .loader {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 4px;
          `
        : css`
            padding-right: 4px;
          `}
  }

  @media ${mobileMore} {
    margin-top: -9px;
  }
`;

const LoaderSubmenu = () => {
  return (
    <StyledLoader>
      <Loaders.Rectangle width="100px" height="28px" className="loader" />
      <Loaders.Rectangle width="100px" height="28px" />
    </StyledLoader>
  );
};

export default LoaderSubmenu;
