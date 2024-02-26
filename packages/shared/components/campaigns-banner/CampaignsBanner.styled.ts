import styled from "styled-components";
import { Base } from "../../themes";
import { mobile } from "../../utils/device";

const BannerWrapper = styled.div<{
  background?: string;
  borderColor?: string;
}>`
  overflow: hidden;
  position: relative;
  min-height: 140px;
  max-height: 140px;
  border-radius: 6px;
  border: 1px solid ${(props) => props.borderColor};
  background-image: url(${(props) => props.background});
  background-size: 100%;

  .close-icon {
    position: absolute;
    right: 14px;
    top: 18px;

    path {
      fill: "#A3A9AE";
    }
  }

  @media ${mobile} {
    min-height: 110px;
  }
`;

BannerWrapper.defaultProps = { theme: Base };

const BannerContent = styled.div`
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header {
    max-width: 167px;
  }
`;

const BannerButton = styled.button<{
  buttonColor?: string;
  buttonTextColor?: string;
}>`
  cursor: pointer;
  width: fit-content;
  padding: 4px 12px;
  border-radius: 32px;
  border: none;
  background: ${(props) => props.buttonColor};
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  color: ${(props) => props.buttonTextColor};
`;

export { BannerWrapper, BannerContent, BannerButton };
