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

import styled from "styled-components";

import { tablet, mobile } from "../../utils";

const StyledHeaderContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 140px 0fr 17px;
  grid-template-rows: 1fr;
  grid-column-gap: 8px;
  margin-top: 22px;
  margin-bottom: 23px;
  align-items: center;

  @media ${tablet} {
    margin-top: 16px;
    margin-bottom: 25px;
    grid-template-columns: 163px 1fr 17px;
  }

  @media ${mobile} {
    margin-top: 14px;
    margin-bottom: 23px;
    grid-template-columns: 140px 1fr 17px;
  }
`;

const StyledHeaderBox1 = styled.div`
  width: 140px;
  height: 24px;

  @media ${tablet} {
    width: 163px;
    height: 28px;
  }

  @media ${mobile} {
    width: 140px;
    height: 24px;
  }
`;

const StyledHeaderBox2 = styled.div`
  display: grid;
  grid-template-columns: 17px 17px;
  grid-template-rows: 1fr;
`;

const StyledHeaderSpacer = styled.div``;

const StyledSubmenu = styled.div`
  width: 100%;
  height: 32px;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

export {
  StyledHeaderContainer,
  StyledHeaderBox1,
  StyledHeaderBox2,
  StyledHeaderSpacer,
  StyledSubmenu,
};
