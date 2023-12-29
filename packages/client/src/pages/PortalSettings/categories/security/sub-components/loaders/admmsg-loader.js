import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

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

  .checkboxs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 50px;
    margin-bottom: 11px;
  }

  .buttons {
    width: calc(100% - 32px);
    position: absolute;
    bottom: 16px;
  }
`;

const AdmMsgLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="37px" />
      <RectangleSkeleton className="description" height="80px" />
      <div className="link">
        <RectangleSkeleton height="20px" width="57px" />
      </div>

      <div className="checkboxs">
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default AdmMsgLoader;
