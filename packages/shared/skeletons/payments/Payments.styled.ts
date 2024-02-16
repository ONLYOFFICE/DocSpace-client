import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";

const StyledPaymentsLoader = styled.div`
  .payments-loader_title {
    height: 28px;
    margin-bottom: 23px;
  }
  .payments-loader_description {
    max-width: 600px;
    height: 40px;
    margin-top: 16px;
    margin-bottom: 24px;
    @media ${mobile} {
      height: 68px;
    }
  }

  .payments-loader_plan-description {
    margin-top: 16px;
  }
  .payments-loader_main {
    display: grid;
    margin-top: 20px;
    max-width: 660px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 453px;
    grid-gap: 20px;

    @media ${mobile} {
      grid-template-columns: 1fr;
    }
  }
`;

export default StyledPaymentsLoader;
