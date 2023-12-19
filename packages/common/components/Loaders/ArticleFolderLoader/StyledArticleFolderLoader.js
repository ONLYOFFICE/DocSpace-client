import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

import { tablet, mobile } from "@docspace/components/utils/device";
import { getCorrectFourValuesStyle } from "@docspace/components/utils/rtlUtils";

const StyledContainer = styled.div`
  margin: 0;

  max-width: 210px;
  padding: ${({ theme }) =>
    getCorrectFourValuesStyle("0 20px 0 0", theme.interfaceDirection)};

  @media ${tablet} {
    width: ${(props) => (props.showText ? "240px" : "52px")};
    padding: ${(props) => {
      const padding = props.showText ? "0 16px 0 16px" : "10px 16px 10px 12px";
      return getCorrectFourValuesStyle(padding, props.theme.interfaceDirection);
    }};
    box-sizing: border-box;
  }

  @media ${mobile} {
    width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
  }
`;

const StyledBlock = styled.div`
  margin: 0;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  @media ${tablet} {
    margin-bottom: 24px;
  }

  .article-folder-loader {
    @media ${tablet} {
      ${(props) => (props.showText ? "width: 200px" : "width: 20px")};
    }
  }
`;

const StyledRectangleLoader = styled(RectangleSkeleton)`
  height: 20px;
  width: 210px;
  padding: 0 0 16px;

  @media ${tablet} {
    height: 20px;
    padding: 0 0 24px;
  }

  @media ${mobile} {
    width: 100%;
    padding: 0 0 24px;
  }
`;

export { StyledBlock, StyledContainer, StyledRectangleLoader };
