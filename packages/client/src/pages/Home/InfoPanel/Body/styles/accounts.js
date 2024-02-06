import styled, { css } from "styled-components";
import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils";

const StyledAccountsItemTitle = styled.div`
  min-height: 80px;
  height: 80px;
  max-height: 104px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: fixed;
  margin-top: -128px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: -20px;
          padding: 24px 20px 24px 0;
        `
      : css`
          margin-left: -20px;
          padding: 24px 0 24px 20px;
        `}
  width: calc(100% - 40px);
  background: ${(props) => props.theme.infoPanel.backgroundColor};
  z-index: 100;

  @media ${tablet} {
    width: 440px;
    padding: 24px 20px 24px 20px;
  }

  @media ${mobile} {
    width: calc(100vw - 32px);
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 24px 16px 24px 0;
          `
        : css`
            padding: 24px 0 24px 16px;
          `}
  }

  .avatar {
    min-width: 80px;
  }

  .info-panel__info-text {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .info-panel__info-wrapper {
      display: flex;
      flex-direction: row;
    }

    .badges {
      height: 22px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }

    .info-text__name {
      font-weight: 700;
      font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
      line-height: 22px;
    }

    .info-text__email {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      line-height: 20px;
      color: ${(props) => props.theme.text.disableColor};
      user-select: text;
    }

    .sso-badge {
      margin-top: 8px;
    }
  }

  .context-button {
    padding-top: 24px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
  }
`;

StyledAccountsItemTitle.defaultProps = { theme: Base };

const StyledAccountContent = styled.div`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin: 128px 0 0 auto;
        `
      : css`
          margin: 128px auto 0 0;
        `}

  .data__header {
    width: 100%;
    padding: 24px 0;

    .header__text {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
    }
  }

  .data__body {
    display: grid;
    grid-template-rows: 28px 28px 28px 1fr;
    grid-template-columns: 80px 1fr;
    grid-gap: 0 24px;
    align-items: center;

    .type-combobox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -8px;
            `
          : css`
              margin-left: -8px;
            `}

      .combo-button {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding-right: 8px;
              `
            : css`
                padding-left: 8px;
              `}
      }

      .backdrop-active {
        height: 100%;
        width: 100%;
        z-index: 1000;
      }
    }

    .info_field {
      line-height: 20px;
      height: 20px;
      padding: 4px 0;
    }

    .info_field_groups {
      height: 100%;
    }

    .info_groups {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: center;
    }
  }
`;

export { StyledAccountsItemTitle, StyledAccountContent };
