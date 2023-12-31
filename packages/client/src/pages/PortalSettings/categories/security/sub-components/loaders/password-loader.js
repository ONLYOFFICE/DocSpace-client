import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledLoader = styled.div`
  padding-right: 8px;

  .header {
    width: 273px;
    margin-bottom: 16px;
  }

  .description {
    margin-bottom: 8px;
  }

  .link {
    margin-bottom: 20px;
  }

  .subheader {
    margin-bottom: 16px;
  }

  .slider {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
  }

  .checkboxs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 50px;
  }

  .buttons {
    width: calc(100% - 32px);
    position: absolute;
    bottom: 16px;
  }
`;

const PasswordLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="37px" />
      <RectangleSkeleton className="description" height="80px" />
      <div className="link">
        <RectangleSkeleton height="20px" width="57px" />
      </div>
      <RectangleSkeleton className="subheader" height="16px" width="171px" />
      <div className="slider">
        <RectangleSkeleton height="24px" width="160px" />
        <RectangleSkeleton height="20px" width="75px" />
      </div>
      <div className="checkboxs">
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default PasswordLoader;
