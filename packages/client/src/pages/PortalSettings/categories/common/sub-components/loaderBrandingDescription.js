import { RectangleSkeleton } from "@docspace/shared/skeletons";
import styled from "styled-components";

const StyledLoader = styled.div`
  padding-bottom: 18px;

  .loader-description {
    display: block;
    padding-bottom: 8px;
  }
`;

const LoaderBrandingDescription = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton
        width="700px"
        height="16px"
        className="loader-description"
      />
      <RectangleSkeleton width="93px" height="16px" />
    </StyledLoader>
  );
};

export default LoaderBrandingDescription;
