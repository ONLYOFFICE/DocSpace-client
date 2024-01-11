import { RectangleSkeleton } from "@docspace/shared/skeletons";
import styled, { css } from "styled-components";

const StyledLoader = styled.div`
  margin-top: 40px;

  .item {
    padding-bottom: 15px;
  }

  .loader-header {
    display: block;
  }

  .flex {
    display: flex;
    align-items: center;
  }

  .checkbox {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 8px;
          `
        : css`
            padding-right: 8px;
          `}
  }

  .button {
    padding-top: 10px;
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

const LoaderAdditionalResources = () => {
  return (
    <StyledLoader>
      <div className="item">
        <RectangleSkeleton
          width="166px"
          height="22px"
          className="loader-header"
        />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="700px"
          height="20px"
          className="loader-description"
        />
      </div>

      <div className="item">
        <div className="flex">
          <RectangleSkeleton width="16px" height="16px" className="checkbox" />
          <RectangleSkeleton width="166px" height="20px" />
        </div>
      </div>

      <div className="item">
        <div className="flex">
          <RectangleSkeleton width="16px" height="16px" className="checkbox" />
          <RectangleSkeleton width="150px" height="20px" />
        </div>
      </div>

      <div className="item">
        <div className="flex">
          <RectangleSkeleton width="16px" height="16px" className="checkbox" />
          <RectangleSkeleton width="157px" height="20px" />
        </div>
      </div>

      <div className="button">
        <RectangleSkeleton width="86px" height="32px" className="save" />
        <RectangleSkeleton width="170px" height="32px" />
      </div>
    </StyledLoader>
  );
};

export default LoaderAdditionalResources;
