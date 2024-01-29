import styled, { css } from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledLoader = styled.div`
  width: 100%;

  .block {
    display: block;
  }

  .padding-bottom {
    padding-bottom: 16px;
  }

  .flex {
    display: flex;
  }

  .padding-right {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 12px;
          `
        : css`
            padding-right: 12px;
          `}
  }

  .preview-title {
    padding-bottom: 8px;
  }

  .preview {
    width: 100%;
    max-width: 575px;
    padding-top: 12px;
    padding-bottom: 32px;
  }
`;

const Loader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton
        height="24px"
        width="93px"
        className="block padding-bottom"
      />
      <RectangleSkeleton
        height="16px"
        width="118px"
        className="block padding-bottom"
      />
      <div className="flex padding-bottom">
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
        <RectangleSkeleton
          height="46px"
          width="46px"
          className="padding-right"
        />
      </div>
      <RectangleSkeleton
        height="16px"
        width="118px"
        className="block padding-bottom"
      />
      <RectangleSkeleton
        height="46px"
        width="46px"
        className="block padding-bottom"
      />
      <RectangleSkeleton
        height="24px"
        width="93px"
        className="block preview-title"
      />
      <RectangleSkeleton height="32px" width="211px" className="block" />
      <RectangleSkeleton height="325px" className="block preview" />
      <RectangleSkeleton height="32px" width="447px" className="block" />
    </StyledLoader>
  );
};

export default Loader;
