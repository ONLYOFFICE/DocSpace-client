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

import styled, { css } from "styled-components";
import { Base, globalColors } from "../../themes";
import { tablet, mobile } from "../../utils/device";

const BannerWrapper = styled.div<{
  background?: string;
  borderColor?: string;
}>`
  overflow: hidden;
  position: relative;
  min-height: 142px;
  max-height: 142px;

  &::before {
    content: "";
    background-image: url(${(props) => props.background});
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: 0% 100%;

    position: absolute;
    z-index: -1000;
    inset: 0px;

    border-radius: 4px;
    border: 1px solid ${(props) => props.borderColor};

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  @media ${mobile} {
    min-height: 132px;
    max-height: 132px;
  }

  .close-icon {
    position: absolute;
    inset-inline-end: 14px;

    top: 18px;

    path {
      fill: ${globalColors.gray};
    }
  }
`;

BannerWrapper.defaultProps = { theme: Base };

const BannerContent = styled.div`
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header {
    max-width: 167px;
  }

  @media ${tablet} {
    .header {
      max-width: 180px;
    }
  }

  @media ${mobile} {
    .header {
      max-width: 75%;
    }

    max-width: 75%;
  }
`;

const BannerButton = styled.button<{
  buttonColor?: string;
  buttonTextColor?: string;
}>`
  cursor: pointer;
  width: fit-content;
  padding: 4px 12px;
  border-radius: 32px;
  border: none;
  background: ${(props) => props.buttonColor};
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  color: ${(props) => props.buttonTextColor};
`;

const BannerIcon = styled.div`
  width: 100px;
  height: 80px;
  z-index: -1;
  position: absolute;
  bottom: 1px;

  inset-inline-end: 1px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}

  @media ${mobile} {
    width: 140px;
    height: 112px;

    svg {
      width: 140px;
      height: 112px;
    }
  }
`;

export { BannerWrapper, BannerContent, BannerButton, BannerIcon };
