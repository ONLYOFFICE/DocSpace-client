import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledLoader = styled.div`
  padding-right: 8px;

  .header {
    width: 273px;
    margin-bottom: 16px;
  }

  .description {
    margin-bottom: 12px;
  }

  .checkboxs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 50px;
    margin-bottom: 15px;
  }

  .add-button {
    width: 85px;
    margin-bottom: 16px;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .buttons {
    width: calc(100% - 32px);
    position: absolute;
    bottom: 16px;
  }
`;

const IpSecurityLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="37px" />
      <RectangleSkeleton className="description" height="80px" />

      <div className="checkboxs">
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
      </div>

      <RectangleSkeleton className="add-button" height="20px" />

      <div className="block">
        <RectangleSkeleton height="22px" width="72px" />
        <RectangleSkeleton height="64px" />
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default IpSecurityLoader;
