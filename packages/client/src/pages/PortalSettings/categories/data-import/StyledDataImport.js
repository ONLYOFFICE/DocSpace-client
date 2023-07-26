import styled from "styled-components";
import { tablet, mobile } from "@docspace/components/utils/device";

const DataImportWrapper = styled.div`
  max-width: 700px;
  margin-top: 4px;

  @media ${mobile} {
    max-width: 343px;
  }

  .data-import-description {
    color: #657077;
    line-height: 20px;
    margin-bottom: 20px;
    max-width: 675px;
  }

  .data-import-subtitle {
    margin-bottom: 21px;
    font-weight: 600;
  }

  .service-list {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
  }

  .service-wrapper {
    border: 1px solid #d0d5da;
    border-radius: 6px;
    width: 340px;
    height: 64px;
    box-sizing: border-box;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;

    &:hover {
      border-color: #4781d1;
    }

    &:active {
      background-color: #eceef1;
    }

    @media ${tablet} {
      width: 328px;
    }

    @media ${mobile} {
      width: 100%;
    }

    .service-icon {
      display: flex;
      align-items: center;
    }
  }
`;

const WorkspaceWrapper = styled.div`
  margin-top: 4px;

  .data-import-subtitle {
    color: #657077;
    max-width: 700px;
    line-height: 20px;
    margin-bottom: 20px;
  }

  .stepper {
    margin-right: 5px;
    font-weight: 700;
    font-size: 16px;
  }

  .step-description {
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: #333333;
  }
`;

export { DataImportWrapper, WorkspaceWrapper };
