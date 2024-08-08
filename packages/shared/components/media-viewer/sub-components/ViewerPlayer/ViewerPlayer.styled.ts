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
import { animated } from "@react-spring/web";

import { tablet, mobile } from "@docspace/shared/utils";
import { globalColors } from "../../../../themes";

export const ContainerPlayer = styled.div<{ $isFullScreen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 305;
  background-color: ${(props) =>
    props.$isFullScreen ? globalColors.darkBlack : "rgba(55, 55, 55, 0.6)"};
  touch-action: none;
`;

export const VideoWrapper = styled(animated.div)<{ $visible: boolean }>`
  inset: 0;
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  height: 100%;
  width: 100%;
  touch-action: none;

  .audio-container {
    width: 190px;
    height: 190px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 20px;
  }
`;

export const StyledPlayerControls = styled.div<{ $isShow: boolean }>`
  position: fixed;
  inset-inline: 0;
  bottom: 0px;
  z-index: 307;
  display: flex;

  width: 100%;
  height: 188px;

  visibility: ${(props) => (props.$isShow ? "visible" : "hidden")};
  opacity: ${(props) => (props.$isShow ? "1" : "0")};

  background: linear-gradient(
    ${globalColors.tapHighlight} 0%,
    rgba(0, 0, 0, 0.64) 48.44%,
    rgba(0, 0, 0, 0.89) 100%
  );

  @media ${tablet} {
    background-color: rgba(0, 0, 0, 0.8);
    height: 80px;
  }
`;

export const ControlContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 30px;

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media ${tablet} {
    margin-top: 8px;
    .player_right-control {
      margin-inline-end: -8px;
    }
  }
`;

export const PlayerControlsWrapper = styled.div`
  padding: 0 30px;
  width: 100%;
  margin-top: 80px;

  @media ${tablet} {
    margin-top: 0px;
  }

  @media ${mobile} {
    padding: 0 15px;
  }
`;
