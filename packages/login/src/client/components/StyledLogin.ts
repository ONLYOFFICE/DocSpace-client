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
  height: 100vh;

  box-sizing: border-box;

  @media ${mobile} {
    height: calc(100% - 48px);
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

  .greeting-container {
    margin-bottom: 40px;
    max-width: 380px;
    min-width: 380px;

    @media ${tablet} {
      max-width: 480px;
      min-width: 480px;
    }

    @media ${mobile} {
      max-width: 100%;
      min-width: 100%;
    }
    p {
      text-align: center;
    }
  }

  .language-combo-box {
    position: fixed;
    right: 28px;
    top: 28px;

    @media ${mobile} {
      top: 7px;
      right: 8px;
    }
  }
  .invitation-info-container {
    margin-bottom: 16px;
    .sign-in-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      margin-bottom: 16px;
      .back-title {
        position: absolute;
        max-width: 60px;
        text-overflow: ellipsis;
        overflow: hidden;

        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                right: 0;
              `
            : css`
                left: 0;
              `};

        display: flex;
        gap: 4px;

        svg {
          ${(props) =>
            props.theme.interfaceDirection === "rtl" &&
            " transform: rotate(180deg)"};
        }

        p {
          color: ${(props) => props.theme.login.backTitle.color};
        }

        p:hover {
          cursor: pointer;
        }
      }
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

  margin-top: 88px;

  @media ${mobile} {
    width: 100%;
    justify-content: start;
    margin-top: 34px;
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
