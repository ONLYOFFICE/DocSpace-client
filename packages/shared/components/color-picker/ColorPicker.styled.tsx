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
import { isMobileOnly } from "react-device-detect";

const Wrapper = styled.div`
  .save-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 10px;
          `
        : css`
            margin-right: 10px;
          `}
  }

  .hex-color-picker .react-colorful {
    width: auto;
    height: 250px;
    padding-bottom: 26px;
  }

  .react-colorful__saturation {
    margin: 16px 0 26px 0;
    border-radius: 3px;
  }

  .hex-color-picker .react-colorful__interactive {
    width: 183px;

    ${isMobileOnly &&
    css`
      width: calc(100vw - 76px);
    `}
  }

  .hex-color-picker .react-colorful__saturation-pointer {
    width: 14px;
    height: 14px;
    transform: none !important;
  }

  .hex-color-picker .react-colorful__hue {
    border-radius: 6px;
    height: 12px;
  }

  .hex-color-picker .react-colorful__hue-pointer {
    width: 30px;
    height: 30px;
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.25);
    border: 8px solid #fff;
  }

  .hex-value {
    height: 32px;
    outline: none;
    padding: 6px 8px;
    border: 1px solid ${(props) => (props.theme.isBase ? "#d0d5da" : "#474747")};
    border-radius: 3px;
    width: 100%;
    box-sizing: border-box;
    background: ${(props) => !props.theme.isBase && "#282828"};
    color: ${(props) => !props.theme.isBase && "#5C5C5C"};
  }

  .hex-value-label {
    line-height: 20px;
  }

  .hex-button {
    display: flex;

    .apply-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}
    }
  }

  .hex-color-picker {
    display: flex;
    flex-direction: column;
    padding-bottom: 16px;
    width: 195px;

    ${isMobileOnly &&
    css`
      width: calc(100vw - 64px);
    `}
  }

  .hex-value-container {
    order: 2;
    padding-bottom: 16px;
  }

  .hex-color-picker .react-colorful {
    order: 1;
  }

  .hex-button {
    order: 3;
  }
`;

export default Wrapper;
