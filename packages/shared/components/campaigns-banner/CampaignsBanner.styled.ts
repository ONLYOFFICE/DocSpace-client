import styled, { css } from "styled-components";
import { Base } from "../../themes";
import { desktop, mobile } from "../../utils/device";

const BannerWrapper = styled.div<{
  background?: string;
  borderColor?: string;
}>`
  overflow: hidden;
  position: relative;
  min-height: 140px;
  max-height: 140px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.borderColor};

  &::before {
    content: "";
    background-image: url(${(props) => props.background});
    background-size: 100%;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: -1000;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform: scaleX(-1);
      `}
  }

  .close-icon {
    position: absolute;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 14px;
          `
        : css`
            right: 14px;
          `}

    top: 18px;

    path {
      fill: "#A3A9AE";
    }
  }

  @media ${mobile} {
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
  }
`;

BannerWrapper.defaultProps = { theme: Base };

const BannerContent = styled.div`
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media ${desktop} {
    .header {
      max-width: 167px;
    }
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
