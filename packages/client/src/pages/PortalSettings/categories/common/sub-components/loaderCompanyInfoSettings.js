import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import styled, { css } from "styled-components";

const StyledLoader = styled.div`
  .item {
    padding-bottom: 12px;
  }

  .loader-header {
    padding-bottom: 5px;
    display: block;
  }

  .loader-label {
    padding-bottom: 4px;
    display: block;
  }

  .button {
    padding-top: 8px;
  }

  .save {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 8px;
          `
        : css`
            padding-right: 8px;
          `}
  }
`;

const LoaderCompanyInfoSettings = () => {
  return (
    <StyledLoader>
      <div className="item">
        <RectangleSkeleton
          width="179px"
          height="22px"
          className="loader-header"
        />
        <RectangleSkeleton width="419px" height="22px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="99px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="35px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="40px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="51px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="51px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="button">
        <RectangleSkeleton width="86px" height="32px" className="save" />
        <RectangleSkeleton width="170px" height="32px" />
      </div>
    </StyledLoader>
  );
};

export default LoaderCompanyInfoSettings;
