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
    width: 675px;

    @media ${tablet} {
      width: 100%;
    }
  }

  .subtitle {
    margin-bottom: 20px;
    width: 675px;

    @media ${tablet} {
      width: 100%;
    }
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 700px;

    @media ${tablet} {
      max-width: 675px;
      .item {
        width: 327.5px;
      }
    }
  }
`;

const DataImportLoader = () => {
  return (
    <StyledLoader>
      <div className="header">
        <RectangleSkeleton className="title" height="40px" />
        <RectangleSkeleton className="subtitle" height="20px" />
      </div>

      <div className="content">
        <RectangleSkeleton className="item" width="340px" height="64px" />
        <RectangleSkeleton className="item" width="340px" height="64px" />
      </div>
    </StyledLoader>
  );
};

export default DataImportLoader;
