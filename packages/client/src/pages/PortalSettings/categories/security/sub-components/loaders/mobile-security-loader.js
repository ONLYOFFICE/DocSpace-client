import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledLoader = styled.div`
  .header {
    width: 273px;
    margin-bottom: 18px;
  }

  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 30px;
  }
`;

const MobileSecurityLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="37px" />
      <div className="submenu">
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
      </div>

      <div className="category">
        <RectangleSkeleton height="22px" width="236px" />
        <RectangleSkeleton height="60px" />
      </div>

      <div className="category">
        <RectangleSkeleton height="22px" width="227px" />
        <RectangleSkeleton height="120px" />
      </div>

      <div className="category">
        <RectangleSkeleton height="22px" />
        <RectangleSkeleton height="40px" />
      </div>

      <div className="category">
        <RectangleSkeleton height="22px" width="101px" />
        <RectangleSkeleton height="40px" />
      </div>
    </StyledLoader>
  );
};

export default MobileSecurityLoader;
