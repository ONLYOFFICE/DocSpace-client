import styled, { css } from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import { mobileMore } from "@docspace/components/utils/device";

const tabletStyles = css`
  .description {
    width: 100%;
    max-width: 700px;
    padding-bottom: 16px;
  }
`;

const StyledLoader = styled.div`
  @media ${mobileMore} {
    ${tabletStyles}
  }
`;

const LoaderDescriptionCustomization = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton height="40px" className="description" />
    </StyledLoader>
  );
};

export default LoaderDescriptionCustomization;
