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
import { isMobile } from "react-device-detect";

export const PageCountWrapper = styled.div<{ isPanelOpen: boolean }>`
  display: flex;
  gap: 10px;
  align-items: center;

  position: fixed;
  bottom: ${isMobile ? "12px" : "108px"};
  // logical property won't work correctly
  left: ${({ theme, isPanelOpen }) => {
    const value = isPanelOpen ? 306 / 2 : 0;
    const operator = theme.interfaceDirection === "rtl" ? "-" : "+";

    return `calc(50% ${operator} ${value}px)`;
  }};
  z-index: 307;

  transform: translateX(-50%);

  padding: ${isMobile ? "12px 16px" : "16px 32px"};
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.4);

  color: white;
  font-size: 12px;
  line-height: 16px;

  box-sizing: border-box;

  svg {
    path {
      fill: white;
    }
  }

  user-select: none;

  transition: background 0.26s ease-out 0s;

  @media (hover: hover) {
    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
`;
