import styled from "styled-components";

import { tablet, mobile } from "../../../utils";
import { RectangleSkeleton } from "../../rectangle";

const StyledContainer = styled.div<{ showText?: boolean }>`
  margin: 0;

  max-width: 216px;
  padding: 0 20px;

  display: flex;
  flex-direction: column;

  @media ${tablet} {
    width: ${(props) => (props.showText ? "240px" : "52px")};
    padding: 0 16px;
    box-sizing: border-box;
  }

  @media ${mobile} {
    width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
  }
`;

const StyledRectangleLoader = styled(RectangleSkeleton)`
  height: 20px;
  width: 216px;
  padding: 0 0 16px;

  @media ${tablet} {
    height: 20px;
    width: 20px;
    padding: 0 0 24px;
  }
`;

export { StyledContainer, StyledRectangleLoader };
