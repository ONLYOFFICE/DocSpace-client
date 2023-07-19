import styled from "styled-components";
import { tablet, mobile } from "@docspace/components/utils/device";

const DataImportWrapper = styled.div`
  max-width: 700px;
  margin-top: 4px;

  @media ${mobile} {
    max-width: 343px;
  }

  .service-icon {
    display: flex;
    align-items: center;
  }

  .data-import-description {
    color: #657077;
    line-height: 20px;
    margin-bottom: 20px;
    max-width: 675px;
  }

  .start-migration-text {
    margin-bottom: 21px;
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
  }
`;

const WorkspaceWrapper = styled.div`
  max-width: 700px;
  margin-top: 4px;

  @media ${mobile} {
    max-width: 343px;
  }

  .data-import-description {
    color: #657077;
    line-height: 20px;
    margin-bottom: 20px;
  }

  .step-counter {
    margin-right: 5px;
    font-weight: 700;
    font-size: 16px;
  }

  .select-file-wrapper {
    max-width: 350px;
  }

  .select-file-description {
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: #333333;
  }

  .select-file-title {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 16px;
  }
`;

export { DataImportWrapper, WorkspaceWrapper };
