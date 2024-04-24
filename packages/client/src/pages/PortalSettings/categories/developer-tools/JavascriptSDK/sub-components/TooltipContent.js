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

import React from "react";
import { Text } from "@docspace/shared/components/text";
import styled from "styled-components";

import XImg from "PUBLIC_DIR/images/x.react.svg";

const Wrapper = styled.div`
  box-sizing: border-box;

  max-width: 216px;
  width: 100%;
  padding: 8px 4px 16px;
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin-bottom: 8px;

  svg {
    cursor: pointer;
    path {
      fill: #333;
    }
  }
`;

const ImgWrapper = styled.div`
  margin-top: 16px;

  img {
    width: 100%;
  }
`;

export const TooltipContent = ({ title, description, img }) => {
  return (
    <Wrapper>
      <HeaderContainer>
        <Text fontSize="16px" fontWeight={700} lineHeight="22px">
          {title}
        </Text>
        {/* <XImg /> */}
      </HeaderContainer>
      <Text>{description}</Text>
      <ImgWrapper>
        <img src={img} alt={title} />
      </ImgWrapper>
    </Wrapper>
  );
};
