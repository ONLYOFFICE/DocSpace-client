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
import { globalColors } from "../../../../themes";

export const SpeedControlWrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;

  &:hover {
    cursor: pointer;
  }

  svg {
    path {
      fill: ${globalColors.white};
    }
  }

  rect {
    stroke: ${globalColors.white};
  }
`;

export const DropDown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 120px;
  width: 48px;

  padding: 4px 0px;

  position: absolute;
  bottom: 48px;
  z-index: 50;

  color: ${globalColors.white};
  background: ${globalColors.black};
  text-align: center;
  border-radius: 7px 7px 0px 0px;
`;

export const DropDownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 48px;
  &:hover {
    cursor: pointer;
    background: ${globalColors.black};
  }
`;

export const ToastSpeed = styled.div`
  position: fixed;

  top: 50%;
  // doesn't require mirroring for RTL
  left: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 72px;
  height: 56px;

  border-radius: 9px;
  visibility: visible;

  transform: translate(-50%, -50%);
  background-color: rgba(51, 51, 51, 0.65);

  svg {
    width: 46px;
    height: 46px;
    path {
      fill: ${globalColors.white};
    }
  }

  rect {
    stroke: ${globalColors.white};
  }
`;
