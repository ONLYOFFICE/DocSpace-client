import { mobile } from "@docspace/components/utils/device";
import styled from "styled-components";
import EmptyScreenContainer from "@docspace/components/empty-screen-container";

export const ErrorView = styled(EmptyScreenContainer)`
  padding: 56px 0 0 0;
  position: relative;
  box-sizing: border-box;

  @media ${mobile} {
    padding: 16px 0 0 0;
    width: 100%;
    max-width: 100%;
  }

  img {
    margin-bottom: 40px;
    height: 360px !important;
    width: 360px !important;
    @media ${mobile} {
      height: 210px !important;
      width: 210px !important;
    }
  }

  .ec-header {
    font-size: 23px;
    line-height: 30px;
    @media ${mobile} {
      font-size: 21px;
      line-height: 28px;
    }
  }

  .ec-buttons {
    width: 100%;
    max-width: 100%;
  }
`;
