import styled, { css } from "styled-components";
import { mobile, tablet } from "@docspace/shared/utils";

export const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 960px;
  box-sizing: border-box;

  @media ${tablet} {
    padding: 0 16px;
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0 16px 0 8px;
          `
        : css`
            padding: 0 8px 0 16px;
          `}
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .password-form {
    width: 100%;
    margin-bottom: 8px;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .public-room-content {
    padding-top: 9%;
    justify-content: unset;
    min-height: unset;

    .public-room-text {
      margin: 8px 0;
    }

    .public-room-name {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .public-room-icon {
      min-width: 32px;
      min-height: 32px;
    }

    .public-room-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export const StyledContent = styled.div`
  min-height: 100vh;
  flex: 1 0 auto;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;

  @media ${mobile} {
    justify-content: start;
    min-height: 100%;
  }
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 56px auto;

  @media ${mobile} {
    width: 100%;
    margin: 0 auto;
  }

  .title {
    margin-bottom: 32px;
    text-align: center;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .docspace-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 64px;
  }

  .password-field-wrapper {
    width: 100%;
  }

  .password-change-form {
    margin-top: 32px;
    margin-bottom: 16px;
  }

  .phone-input {
    margin-bottom: 24px;
  }

  .delete-profile-confirm {
    margin-bottom: 8px;
  }

  .phone-title {
    margin-bottom: 8px;
  }
`;
