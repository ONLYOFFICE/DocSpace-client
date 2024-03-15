import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { tablet } from "@docspace/shared/utils/device";

const StyledLoader = styled.div`
  padding-right: 8px;

  .header {
    display: flex;
    flex-direction: column;
    max-width: 700px;

    @media ${tablet} {
      max-width: 675px;
    }
  }

  .title {
    margin-bottom: 20px;
  }

  .subtitle {
    margin-bottom: 8px;
    width: 120px;
  }

  .description {
    margin-bottom: 16px;
  }

  .content {
    display: flex;
    flex-direction: column;
    max-width: 350px;

    .item {
      margin: 4px 0px 16px;
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    max-width: 350px;

    .next {
      margin-right: 8px;
    }
  }
`;

const SelectFileLoader = () => {
  return (
    <StyledLoader>
      <div className="header">
        <RectangleSkeleton className="title" height="40px" />
        <RectangleSkeleton className="subtitle" height="22px" />
        <RectangleSkeleton className="description" height="32px" />
      </div>

      <div className="content">
        <RectangleSkeleton width="200px" height="20px" />
        <RectangleSkeleton className="item" height="32px" />
      </div>

      <div className="buttons">
        <RectangleSkeleton className="next" width="117px" height="32px" />
        <RectangleSkeleton className="back" width="87px" height="32px" />
      </div>
    </StyledLoader>
  );
};

export default SelectFileLoader;
