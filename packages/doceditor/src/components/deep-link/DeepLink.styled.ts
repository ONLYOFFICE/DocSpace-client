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

import styled from "styled-components";
import { injectDefaultTheme, mobile } from "@docspace/shared/utils";

export const StyledSimpleNav = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  background-color: ${(props) => props.theme?.deepLink?.navBackground};
  margin-bottom: 32px;
`;

export const StyledDeepLink = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;

  @media ${mobile} {
    width: calc(100% - 32px);
  }
`;

export const StyledBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  .title {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;

    @media ${mobile} {
      font-size: 23px;
      font-weight: 700;
      line-height: 28px;
    }
  }
`;

export const StyledFileTile = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background-color: ${(props) => props.theme?.deepLink?.fileTileBackground};
  border-radius: 3px;
  align-items: center;
`;

export const StyledActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .stay-link {
    text-align: center;
  }
`;

export const BgBlock = styled.div<{ bgPattern: string }>`
  background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  position: fixed;
  inset: 0;
  z-index: 0;

  @media ${mobile} {
    background-image: none;
  }
`;

export const StyledWrapper = styled.div`
  height: 100%;
  width: 100vw;

  @media ${mobile} {
    margin: 0 auto;
    align-items: flex-start;
  }
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100vw;
  margin-bottom: 16px;

  @media ${mobile} {
    margin: 0 auto;
    align-items: flex-start;
  }
`;
export const LogoWrapper = styled.div`
  margin-bottom: 64px;
  margin-top: 56px;

  @media ${mobile} {
    margin-top: 32px;
  }
`;
