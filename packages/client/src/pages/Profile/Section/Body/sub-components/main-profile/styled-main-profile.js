import styled, { css } from "styled-components";
import { mobile, tablet } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";

export const StyledWrapper = styled.div`
  width: 100%;
  max-width: 660px;

  display: flex;
  padding: 24px 24px 18px 24px;
  gap: 40px;
  background: ${(props) => props.theme.profile.main.background};
  border-radius: 12px;

  box-sizing: border-box;

  .avatar {
    min-width: 124px;
  }

  @media ${tablet} {
    max-width: 100%;
  }
`;

export const StyledAvatarWrapper = styled.div`
  display: flex;

  .badges-wrapper {
    display: none;

    @media ${mobile} {
      display: flex;
      position: fixed;
      right: 16px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              left: 16px;
            `
          : css`
              right: 16px;
            `}
    }
  }
`;

export const StyledInfo = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding-top: 5px;

  .rows-container {
    display: grid;
    grid-template-columns: minmax(75px, auto) 1fr;
    gap: 24px;
    max-width: 100%;

    .profile-block {
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .profile-block-field {
        display: flex;
        gap: 8px;
        height: 20px;
        align-items: center;
        line-height: 20px;
      }

      .sso-badge {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: 18px;
              `
            : css`
                margin-left: 18px;
              `}
      }

      .profile-block-password {
        margin-top: 16px;
      }

      .email-container {
        margin-top: 16px;

        .send-again-desktop {
          display: flex;
        }
      }
      .language-combo-box-wrapper {
        display: flex;
        height: 28px;
        align-items: center;
        margin-top: 11px;
        gap: 8px;

        .language-combo-box .combo-button {
          padding-inline-end: 0px;
        }

        @media ${tablet} {
          height: 36px;
          margin-top: 7px;
        }
      }
    }
  }

  .mobile-profile-block {
    display: none;
  }

  .edit-button {
    min-width: 12px;

    svg path {
      fill: ${(props) => props.theme.isBase && `#657077`};
    }
  }

  .email-edit-container {
    display: flex;
    align-items: center;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 16px;
          `
        : css`
            padding-right: 16px;
          `}
    line-height: 20px;

    .email-text-container {
      ${(props) =>
        props.withActivationBar &&
        css`
          color: ${props.theme.profile.main.pendingEmailTextColor};
        `}
    }

    .email-edit-button {
      display: block;
      padding-left: 8px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 8px;
            `
          : css`
              padding-left: 8px;
            `}
    }
  }

  .send-again-container {
    display: flex;
    flex-grow: 1;
    max-width: 50%;
    cursor: pointer;
    align-items: center;
    cursor: pointer;
    height: 18px;

    .send-again-text {
      margin-left: 5px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 5px;
            `
          : css`
              margin-left: 5px;
            `}
      line-height: 15px;
      color: ${(props) => props.currentColorScheme.main?.accent};
      border-bottom: 1px solid
        ${(props) => props.currentColorScheme.main?.accent};
      margin-top: 2px;
    }

    .send-again-icon {
      display: block;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      div {
        width: 12px;
        height: 12px;
      }

      svg {
        width: 12px;
        height: 12px;

        path {
          fill: ${(props) => props.currentColorScheme.main?.accent};
        }
      }
    }
  }

  .profile-language {
    display: flex;
  }

  .mobile-profile-row {
    background: ${(props) => props.theme.profile.main.mobileRowBackground};

    .mobile-profile-field {
      align-items: ${({ theme }) =>
        theme.interfaceDirection === "rtl" ? `flex-start` : `baseline`};
    }

    .mobile-profile-label {
      font-size: ${(props) =>
        props.theme.getCorrectFontSize("12px")} !important;
    }

    .mobile-profile-label-field {
      font-size: ${(props) =>
        props.theme.getCorrectFontSize("12px")} !important;
    }

    .edit-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
      min-width: 12px;

      svg path {
        fill: ${(props) => props.theme.isBase && `#657077`};
      }
    }

    .mobile-profile-password {
      font-size: ${(props) =>
        props.theme.getCorrectFontSize("12px")} !important;
    }
  }
`;

export const StyledLabel = styled(Text)`
  display: block;
  align-items: center;
  gap: 4px;

  min-width: 100%;
  width: 100%;
  line-height: 20px;
  white-space: nowrap;
  color: ${(props) => props.theme.profile.main.descriptionTextColor};

  overflow: hidden;
  text-overflow: ellipsis;

  margin-top: ${({ marginTopProp }) => (marginTopProp ? marginTopProp : 0)};
`;
