import styled, { css } from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
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
      <RectangleSkeleton width="100px" height="28px" className="loader" />
      <RectangleSkeleton width="100px" height="28px" />
    </StyledLoader>
  );
};

export default LoaderSubmenu;
