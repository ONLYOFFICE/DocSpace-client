import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledLoader = styled.div`
  .section {
    padding-bottom: 16px;
  }
  .title-long {
    width: 283px;
    padding-bottom: 4px;
  }

  .width {
    width: 100%;
  }

  .padding-bottom {
    padding-bottom: 4px;
  }

  .padding-top {
    padding-top: 5px;
  }

  .display {
    display: block;
  }
`;

const LoaderCustomizationNavbar = () => {
  return (
    <StyledLoader>
      <div className="section">
        <RectangleSkeleton height="22px" className="title-long" />
        <RectangleSkeleton height="80px" className="width padding-bottom" />
        <RectangleSkeleton height="20px" width="73px" />
      </div>

      <div className="section">
        <RectangleSkeleton
          height="22px"
          width="201px"
          className="title padding-bottom display"
        />
        <RectangleSkeleton height="80px" className="width" />
      </div>

      <div className="section">
        <RectangleSkeleton
          height="22px"
          width="119px"
          className="padding-top"
        />
        <RectangleSkeleton height="40px" className="width" />
        <RectangleSkeleton
          height="20px"
          width="73px"
          className="width padding-top"
        />
      </div>

      <div className="section">
        <RectangleSkeleton
          height="22px"
          width="150px"
          className="title padding-bottom display"
        />
        <RectangleSkeleton
          height="20px"
          width="253px"
          className="padding-top"
        />
      </div>
    </StyledLoader>
  );
};

export default LoaderCustomizationNavbar;
