import styled, { css } from "styled-components";
import { tablet } from "@docspace/shared/utils";

export const StyledHeader = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  .action-button {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: row;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 17px;
          `
        : css`
            margin-left: 17px;
          `}
    @media ${tablet} {
      flex-direction: row-reverse;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
      & > div:first-child {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding: 8px 0px 8px 16px;
                margin-left: -16px;
              `
            : css`
                padding: 8px 16px 8px 0px;
                margin-right: -16px;
              `}
      }
    }

    .tariff-bar {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
    }
  }
  .arrow-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform: scaleX(-1);
      `}
    @media ${tablet} {
      padding: 8px 16px 8px 16px;
      margin-left: -16px;
      margin-right: -16px;
    }

    padding-top: 1px;
    width: 17px;
    min-width: 17px;
  }

  .header-headline {
    white-space: nowrap;
    line-height: 25px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 17px;
          `
        : css`
            margin-left: 17px;
          `}
  }
`;
