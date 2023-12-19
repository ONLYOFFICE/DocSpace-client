import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import { tablet, mobile } from "@docspace/components/utils/device";

const StyledLoader = styled.div`
  .header {
    width: 296px;
    height: 29px;
    margin-bottom: 14px;

    @media ${tablet} {
      width: 184px;
      height: 37px;
    }

    @media ${mobile} {
      width: 273px;
      height: 37px;
      margin-bottom: 18px;
    }
  }

  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 22px;
  }

  .owner {
    width: 700px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;

    @media ${mobile} {
      width: 100%;
    }

    .header {
      height: 40px;
      @media ${tablet} {
        height: 60px;
      }
    }
  }

  .admins {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .description {
      width: 700px;
      @media ${tablet} {
        width: 100%;
      }
    }
  }
`;

const AccessLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="100%" />
      <div className="submenu">
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
      </div>
      <div className="owner">
        <RectangleSkeleton className="header" height="100%" />
        <RectangleSkeleton height="82px" />
      </div>
      <div className="admins">
        <RectangleSkeleton height="22px" width="77px" />
        <RectangleSkeleton height="20px" width="56px" />
        <RectangleSkeleton className="description" height="40px" />
      </div>
    </StyledLoader>
  );
};

export default AccessLoader;
