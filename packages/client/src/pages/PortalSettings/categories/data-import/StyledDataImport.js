import styled from "styled-components";
import { tablet, mobile } from "@docspace/components/utils/device";

const StyledWrapper = styled.div`
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

export { StyledWrapper };
