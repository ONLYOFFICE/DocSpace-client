// (c) Copyright Ascensio System SIA 2009-2024
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

import { mobile } from "@docspace/shared/utils";

import type { CompletedFormLayoutProps } from "./CompletedForm.types";

export const CompletedFormLayout = styled.section<CompletedFormLayoutProps>`
  display: flex;
  align-items: center;
  flex-direction: column;

  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  width: 100%;
  height: 100%;
  padding: 100px 16px 0px;

  background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;

  picture {
    margin-bottom: 125px;
  }

  .link {
    font-size: 13px;
    line-height: 15px;
    font-weight: 600;
    color: ${(props) => props.theme.completedForm.linkColor};
  }

  @media ${mobile} {
    background-image: none;

    padding-top: 0px;

    .completed-form__icon {
      width: 343px;
      height: auto;
    }

    picture {
      display: flex;
      align-self: center;
      justify-content: center;
      height: 48px;
      width: 100vw;
      margin: 0 -16px;

      margin-bottom: 32px;

      background-color: ${(props) => props.theme?.login?.navBackground};

      img {
        height: 24px;
        align-self: center;
      }
    }
  }
`;

export const ButtonWrapper = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;

  gap: 8px;

  margin-bottom: 24px;
  max-width: 600px;
  width: 100%;

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
  gap: 20px;

  margin-top: 24px;

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
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "form-file form-file form-file"
    "form-number manager manager";

  gap: 16px;

  margin-bottom: 32px;

  .completed-form__file {
    grid-area: form-file;
  }

  .completed-form__filename {
    font-size: 14px;
    line-height: 16px;

    margin: 0px;
  }

  .completed-form__download {
    cursor: pointer;
    margin-inline-start: auto;
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
`;

export const FormNumberWrapper = styled.div`
  display: flex;
  flex-direction: column;

  grid-area: form-number;

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
    }

    .manager__mail {
      grid-area: mail;

      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
`;
