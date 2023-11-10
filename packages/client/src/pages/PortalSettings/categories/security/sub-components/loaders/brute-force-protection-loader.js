import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledLoader = styled.div`
  padding-right: 8px;

  .header {
    margin-bottom: 12px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .buttons {
    width: calc(100% - 32px);
    position: absolute;
    bottom: 16px;
  }
`;

const BruteForceProtectionLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="80px" />

      <div className="content">
        <div>
          <RectangleSkeleton width="140px" height="20px" />
          <RectangleSkeleton height="32px" />
        </div>

        <div>
          <RectangleSkeleton width="117px" height="20px" />
          <RectangleSkeleton height="32px" />
        </div>

        <div>
          <RectangleSkeleton width="117px" height="20px" />
          <RectangleSkeleton height="32px" />
        </div>
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default BruteForceProtectionLoader;
