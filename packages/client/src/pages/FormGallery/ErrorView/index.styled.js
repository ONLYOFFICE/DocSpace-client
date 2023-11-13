import { mobile } from "@docspace/components/utils/device";
import styled from "styled-components";
import { ReactSVG } from "react-svg";
import Headline from "@docspace/common/components/Headline";
import { Base } from "@docspace/components/themes";

export const ErrorView = styled.div`
  padding-top: 56px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  @media ${mobile} {
    padding-top: 16px;
  }
`;

export const ErrorImage = styled(ReactSVG)`
  svg {
    height: 360px;
    width: 360px;

    @media ${mobile} {
      height: 210px;
      width: 210px;
    }
  }
`;

export const StyledHeadline = styled(Headline)`
  margin: 40px 0 8px 0;

  font-size: 23px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;

  @media ${mobile} {
    font-size: 21px;
  }
`;

export const SubHeading = styled.div`
  margin: 0 0 24px 0;

  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-align: center;

  color: ${({ theme }) => theme.oformGallery.errorView.subHeaderTextColor};
`;

SubHeading.defaultProps = { theme: Base };
