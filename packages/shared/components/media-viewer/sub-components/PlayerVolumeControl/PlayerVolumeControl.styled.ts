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

import { tablet } from "@docspace/shared/utils";
import { globalColors } from "../../../../themes";

export const PlayerVolumeControlWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: 10px;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const mobilecss = css`
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: visible;
    opacity: 1;
    background: ${globalColors.white};
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: visible;
    opacity: 1;
    background: ${globalColors.white};
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
  }

  input[type="range"]::-ms-fill-upper {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: visible;
    opacity: 1;
    background: ${globalColors.white};
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

export const VolumeWrapper = styled.div`
  width: 123px;
  height: 28px;
  display: flex;
  align-items: center;
  padding-inline-start: 9px;

  input {
    margin-inline-end: 15px;
    width: 80%;
    height: 4px;

    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;

    border-radius: 5px;

    background: rgba(255, 255, 255, 0.3);
    background-image: linear-gradient(
      ${globalColors.white},
      ${globalColors.white}
    );
    background-repeat: no-repeat;

    &:hover {
      cursor: pointer;
    }

    @media ${tablet} {
      width: 63%;
    }
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: ${globalColors.white};
  }

  input[type="range"]::-moz-range-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: ${globalColors.white};
  }

  input[type="range"]::-ms-fill-upper {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: ${globalColors.white};
  }

  &:hover {
    input[type="range"]::-webkit-slider-thumb {
      visibility: visible;
      height: 10px;
      width: 10px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      visibility: visible;
      height: 10px;
      width: 10px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    input[type="range"]::-ms-fill-upper {
      visibility: visible;
      height: 10px;
      width: 10px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  @media ${tablet} {
    ${mobilecss}
  }
`;
