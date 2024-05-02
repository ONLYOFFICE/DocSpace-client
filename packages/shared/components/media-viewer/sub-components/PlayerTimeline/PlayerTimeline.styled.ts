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
import { isMobile } from "react-device-detect";

import { tablet, desktop } from "@docspace/shared/utils";

export const HoverProgress = styled.div`
  display: none;
  position: absolute;
  left: 0px;

  height: 6px;

  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
`;

export const Progress = styled.div`
  position: absolute;
  left: 0px;
  width: 0;
  height: 4px;

  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.4);
`;

const mobileCss = css`
  margin-top: 16px;

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: visible;
    opacity: 1;
    background: #fff;
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
    background: #fff;
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  input[type="range"]::-ms-fill-upper {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: visible;
    opacity: 1;
    background: #fff;
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

export const PlayerTimelineWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  margin-top: 12px;

  height: 4px;
  width: 100%;

  cursor: pointer;

  time {
    display: none;
    position: absolute;
    left: 50%;
    top: -25px;
    font-size: 13px;
    color: #fff;
    pointer-events: none;
    transform: translateX(-50%);
  }

  @media (hover: hover) {
    &:hover {
      /* height: 6px; */
      input {
        height: 6px;
      }
      ${HoverProgress} {
        display: block;
      }
      transition: 0.1s height ease-in;
    }

    &:hover time {
      display: block;
    }
  }

  input {
    width: 100%;
    height: 4px;

    margin: 0px;

    outline: none;

    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;

    border-radius: 5px;

    background: rgba(255, 255, 255, 0.3);
    background-image: linear-gradient(#fff, #fff);
    background-repeat: no-repeat;

    z-index: 1;

    &:hover {
      cursor: pointer;
    }

    transition: height 0.3s ease 0s;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: #fff;

    transition:
      opacity 0.3s ease 0s,
      visibility 0.3s ease 0s;
  }

  input[type="range"]::-moz-range-thumb {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: #fff;
    transition:
      opacity 0.3s ease 0s,
      visibility 0.3s ease 0s;
  }

  input[type="range"]::-ms-fill-upper {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    visibility: hidden;
    opacity: 0;
    background: #fff;
    transition:
      opacity 0.3s ease 0s,
      visibility 0.3s ease 0s;
  }

  &:hover {
    input[type="range"]::-webkit-slider-thumb {
      visibility: visible;
      height: 12px;
      width: 12px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      visibility: visible;
      height: 12px;
      width: 12px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    input[type="range"]::-ms-fill-upper {
      visibility: visible;
      height: 12px;
      width: 12px;
      opacity: 1 !important;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  @media ${desktop} {
    ${isMobile && mobileCss}
  }

  @media ${tablet} {
    ${mobileCss}
  }
`;
