import styled, { css } from "styled-components";
import { tablet, mobile } from "@docspace/shared/utils";

export const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 320px;

  @media ${tablet} {
    width: 100%;
  }
`;

interface ILoginFormWrapperProps {
  enabledJoin?: boolean;
  isDesktop?: boolean;
  bgPattern?: string;
}

interface ILoginContentProps {
  enabledJoin?: boolean;
}

interface IStyledCaptchaProps {
  isCaptchaError?: boolean;
  theme?: IUserTheme;
}

export const LoginFormWrapper = styled.div`
  width: 100%;
  height: ${(props) => (props.enabledJoin ? "calc(100vh - 68px)" : "100vh")};

  box-sizing: border-box;

  @media ${mobile} {
    height: 100%;
  }

  .bg-cover {
    background-image: ${(props) => props.bgPattern};
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;

    @media ${mobile} {
      background-image: none;
    }
  }
`;

export const LoginContent = styled.div`
  flex: 1 0 auto;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  height: 100%;

  @media ${mobile} {
    width: 100%;
    justify-content: start;
  }
`;

export const StyledCaptcha = styled.div`
  margin: 24px 0;

  width: fit-content;
  .captcha-wrapper {
    ${(props: IStyledCaptchaProps) =>
      props.isCaptchaError &&
      css`
        border: ${props.theme.login.captcha.border};
        padding: 4px 4px 4px 2px;
      `};

    margin-bottom: 2px;
  }

  ${(props: IStyledCaptchaProps) =>
    props.isCaptchaError &&
    css`
      p {
        color: ${props.theme.login.captcha.color};
      }
    `}
`;
