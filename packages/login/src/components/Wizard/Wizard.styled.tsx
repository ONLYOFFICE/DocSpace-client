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

import styled, { css } from "styled-components";

import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils/device";

export const WizardFormWrapper = styled.div<{ bgPattern: string }>`
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
      height: 0;
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

  }
`;

WizardFormWrapper.defaultProps = { theme: Base };

export const WizardContent = styled.div`
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px * 2);

  margin: 56px auto;

  @media ${mobile} {
    width: 100%;
    justify-content: start;
    margin: 0;
  }
`;

WizardContent.defaultProps = { theme: Base };
