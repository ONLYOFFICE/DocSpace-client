import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import { mobile } from "@docspace/components/utils/device";

const StyledLoader = styled.div`
  display: flex;
  flex-direction: column;

  .header {
    width: 155px;
    height: 22px;
    margin-bottom: 8px;

    @media ${mobile} {
      width: 171px;
    }
  }

  .subheader {
    width: 297px;
    height: 16px;
    margin-bottom: 16px;

    @media ${mobile} {
      width: 100%;
    }
  }

  .body {
    width: 100%;
    max-width: 700px;
  }

  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 22px;
  }
`;

const DeleteDataLoader = () => {
  return (
    <StyledLoader>
      <div className="submenu">
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
      </div>
      <RectangleSkeleton className="header" />
      <RectangleSkeleton className="subheader" />
      <RectangleSkeleton className="body" height="100px" />
    </StyledLoader>
  );
};

export default DeleteDataLoader;
