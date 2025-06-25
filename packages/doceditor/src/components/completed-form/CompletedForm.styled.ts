// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import styled from "styled-components";

import { mobile, mobileMore, tablet } from "@docspace/shared/utils";

import type { CompletedFormLayoutProps } from "./CompletedForm.types";

export const ContainerCompletedForm = styled.section<CompletedFormLayoutProps>`
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;

  width: 100%;
  min-height: 100dvh;
  height: 100%;

  .scroller {
    > .scroll-body {
      display: flex;
      flex-direction: column;
      padding-inline-end: 16px !important;
    }
  }

  .completed-form__default-layout {
    padding: clamp(42px, 8vh, 100px) 16px 16px;
  }

  @media ${mobile} {
    .completed-form__default-layout {
      padding: 0px 16px 16px;
    }

    background-image: none;
  }
`;

export const CompletedFormLayout = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  padding: clamp(42px, 8vh, 100px) 0px 16px 16px;

  .completed-form__logo {
    margin-bottom: clamp(40px, 8vh, 125px);
    user-select: none;
    img {
      height: 44px;
    }
  }

  .link {
    font-size: 13px;
    line-height: 15px;
    font-weight: 600;
    color: ${(props) => props.theme.completedForm.linkColor};
  }

  .completed-form__empty {
    gap: 20px;
    margin-top: 24px;
  }

  &.completed-form__vdr-layout {
    max-width: 785px;
    width: 100%;
    align-self: center;
  }

  @media ${mobileMore} and (max-height: 650px) {
    padding-top: 42px;
    .completed-form__logo {
      margin-bottom: 40px;
    }
  }

  @media ${tablet} {
    &.completed-form__vdr-layout {
      max-width: 600px;
    }
  }

  @media ${mobile} {
    padding-top: 0px;

    .completed-form__icon {
      width: 343px;
      height: auto;
    }

    .completed-form__logo {
      display: flex;
      align-self: center;
      justify-content: center;
      height: 48px;
      width: calc(100% + 32px);
      margin: 0 -16px;

      margin-bottom: 32px;

      background-color: ${(props) => props.theme?.login?.navBackground};

      img {
        height: 24px;
        align-self: center;
      }
    }

    .completed-form__empty {
      gap: 20px;
      margin-top: 24px;
    }
  }
`;

export const ButtonWrapper = styled.footer<{ isShareFile: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  gap: 8px;

  margin-bottom: 24px;
  max-width: 600px;
  width: ${(props) => (props.isShareFile ? "298px" : "100%;")};

  @media ${mobile} {
    flex-wrap: wrap;
    gap: 16px;

    margin-bottom: 20px;
  }
`;

export const TextWrapper = styled.section`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 32px;

  /* margin-top: 32px; */

  h1 {
    line-height: 28px;
    font-size: 23px;
    font-weight: 700;
    text-align: center;
    margin: 0;
  }

  p {
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.completedForm.descriptionColor};
    text-align: center;
    max-width: 600px;
  }

  &.completed-form__text-wrapper {
    p {
      max-width: 100%;
    }
  }
`;

export const Box = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  background-color: ${(props) => props.theme.completedForm.box.background};

  padding: 16px;

  width: 100%;

  border-radius: 6px;
`;

export const MainContent = styled.main`
  max-width: 600px;
  width: 100%;

  display: grid;
  grid-template-columns: 45fr 101fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "form-file form-file form-file"
    "form-number manager manager";

  gap: 16px;

  margin: 32px 0;

  .completed-form__file {
    grid-area: form-file;

    svg {
      flex-shrink: 0;
    }
  }

  .completed-form__filename {
    font-size: 14px;
    line-height: 16px;

    margin: 0px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .completed-form__download {
    cursor: pointer;
    margin-inline-start: auto;
    flex-shrink: 0;
  }

  .label {
    display: inline-block;
    margin-bottom: 4px;

    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.completedForm.labelColor};
  }

  .completed-form__form-number {
    font-size: 42px;
    line-height: 1.1;
    font-weight: 600;
    color: ${(props) => props.theme.completedForm.descriptionColor};
  }

  @media ${mobile} {
    grid-template-columns: 100%;

    grid-template-areas:
      "form-file"
      "form-number"
      "manager";
  }
`;

export const FormNumberWrapper = styled.div`
  display: flex;
  flex-direction: column;

  grid-area: form-number;

  .form-number--big {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  @media ${mobileMore} {
    .form-number--big {
      font-size: 23px;
      line-height: 28px;
    }
  }

  > div {
    justify-content: center;
    flex-grow: 1;
  }
`;

export const ManagerWrapper = styled.div`
  display: flex;
  flex-direction: column;

  grid-area: manager;

  > ${Box} {
    flex-grow: 1;

    display: grid;
    grid-template-columns: 46px 1fr;
    grid-template-areas:
      "avatar user-name"
      "avatar mail";

    gap: 4px 16px;

    .manager__avatar {
      grid-area: avatar;
      width: 46px;
      min-width: 46px;
      height: 46px;
    }

    .manager__user-name {
      grid-area: user-name;

      margin: 0px;
      font-size: 16px;
      line-height: 22px;
      font-weight: 700;

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      /* max-width: 300px; */
    }

    .manager__mail {
      grid-area: mail;
      display: flex;
      gap: 8px;

      align-items: center;

      span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      svg {
        flex: 0 0 auto;
      }
    }

    @media ${mobile} {
      grid-template-columns: 100%;
      grid-template-areas:
        "avatar"
        "user-name"
        "mail";

      .manager__avatar {
        justify-self: center;
      }

      .manager__user-name {
        text-align: center;
      }
      .manager__mail {
        justify-content: center;
      }
    }
  }
`;

export const VDRMainContent = styled.main`
  display: grid;
  gap: 16px;

  align-items: start;

  width: 100%;

  grid-template-columns: 397fr 372fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "form-file form-roles"
    "form-link form-roles"
    "_ form-roles";
  margin: 32px 0;

  .completed-form__file {
    grid-area: form-file;

    cursor: pointer;

    svg {
      flex-shrink: 0;
    }

    .completed-form__file-name {
      margin: 0px;
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      letter-spacing: 0px;
    }

    .completed-form_icon {
      margin-inline-start: auto;
      cursor: pointer;
      path {
        fill: ${(props) => props.theme.inputBlock.iconColor};
      }
    }
  }

  .completed-form__form-link {
    grid-area: form-link;
    color: ${(props) => props.theme.completedForm.descriptionColor};
  }

  .completed-form__roles {
    grid-area: form-roles;
    flex-direction: column;
    align-items: flex-start;

    ul {
      min-height: 20px;
      margin-block-start: 8px;
    }
  }

  .input__copy-link input {
    width: 100%;
    font-size: 16px;
    line-height: 22px;
    padding: 11px 12px;
  }

  @media ${mobile} {
    grid-template-columns: 1fr;
    grid-template-areas:
      "form-file"
      "form-link "
      "form-roles";
  }

  .input__copy-link-icon {
    /* padding: 0; */

    @media (hover: hover) {
      &:hover {
        svg path {
          fill: ${(props) => props.theme.inputBlock.hoverIconColor} !important;
        }
      }
    }

    svg {
      cursor: pointer;
      path {
        fill: ${(props) => props.theme.inputBlock.iconColor} !important;
      }
    }
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Footer = styled.footer`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "primary-button secondary-button"
    "link link";
  justify-items: center;

  gap: 16px 8px;
  width: 100%;

  .link {
    grid-area: link;
    color: ${({ theme }) =>
      theme.currentColorScheme?.main.buttons ?? `#{$light-blue-main}`};
    text-underline-offset: 2px;

    @media (hover: hover) {
      &:hover {
        opacity: 0.85;
      }
    }

    :active {
      filter: brightness(82%);
    }
    ::first-letter {
      text-transform: capitalize;
    }
  }

  .primary-button {
    grid-area: primary-button;
  }
  .secondary-button {
    .button-content {
      display: inline-block;
      height: auto;

      ::first-letter {
        text-transform: capitalize;
      }
    }

    grid-area: secondary-button;
  }

  @media ${mobile} {
    grid-template-columns: 1fr;
    grid-template-areas:
      "primary-button"
      "secondary-button"
      "link";
    gap: 8px;
  }
`;
