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

import { desktop, injectDefaultTheme, mobile } from "@docspace/shared/utils";

// doesn't require mirroring for RTL

const StyledErrorContainer = styled.div.attrs(injectDefaultTheme)<{
  isEditor: boolean;
}>`
  background: ${(props) => props.theme.errorContainer.background};
  cursor: default;
  width: ${(props) => (props.isEditor ? "100%" : "auto")};
  height: "100%";

  ${(props) =>
    props.isEditor &&
    css`
      position: absolute;
    `}
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 8px 0;
  padding-top: 100px;
  border: 0;
  box-sizing: border-box;

  .error_description_link {
    color: ${(props) => props.theme.errorContainer.linkColor};
    font-size: 13px;
    font-weight: 600;
  }

  #container {
    position: relative;
    margin: 64px 16px 48px 16px;
  }

  #header {
    font-weight: 700;
    font-size: 23px;
    line-height: 28px;
    margin: 8px 0 20px 0;
    text-align: center;
  }

  #text {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    margin-bottom: 24px;
    max-width: 560px;
    padding: 0;
  }

  #button-container {
    width: 320px;
    margin-top: 24px;
  }

  #customized-text {
    color: ${(props) => props.theme.errorContainer.bodyText};
  }

  @media ${desktop} {
    body {
      padding: 24px 24px 0 24px;
    }
  }

  @media ${mobile} {
    padding-top: 80px;

    body {
      padding: 18px 18px 0 18px;
    }

    #header {
      margin-top: 12px;
    }

    #container {
      margin: 12px 16px 36px 16px;
    }

    #button-container {
      width: 100%;
    }

    #button {
      width: 100%;
    }
  }

  #background {
    width: 100%;
    height: auto;
    -webkit-animation: fadein_background 1s;
    -moz-animation: fadein_background 1s;
    -ms-animation: fadein_background 1s;
    -o-animation: fadein_background 1s;
    animation: fadein_background 1s;
  }

  @keyframes fadein_background {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @-moz-keyframes fadein_background {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @-webkit-keyframes fadein_background {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @-ms-keyframes fadein_background {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  #birds {
    position: absolute;
    left: 56.8%;
    top: 27.4%;
    width: 35%;
    height: 33.7%;
    z-index: 1;
    -webkit-animation: fadein_birds 1s;
    -moz-animation: fadein_birds 1s;
    -ms-animation: fadein_birds 1s;
    -o-animation: fadein_birds 1s;
    animation: fadein_birds 1s;
  }

  @keyframes fadein_birds {
    from {
      opacity: 0;
      left: 56.8%;
      top: 0;
    }

    to {
      opacity: 1;
      left: 56.8%;
      top: 27.4%;
    }
  }

  @-moz-keyframes fadein_birds {
    from {
      opacity: 0;
      left: 56.8%;
      top: 0;
    }

    to {
      opacity: 1;
      left: 56.8%;
      top: 27.4%;
    }
  }

  @-webkit-keyframes fadein_birds {
    from {
      opacity: 0;
      left: 56.8%;
      top: 0;
    }

    to {
      opacity: 1;
      left: 56.8%;
      top: 27.4%;
    }
  }

  @-ms-keyframes fadein_birds {
    from {
      opacity: 0;
      left: 56.8%;
      top: 0;
    }

    to {
      opacity: 1;
      left: 56.8%;
      top: 27.4%;
    }
  }

  #mountain-left {
    position: absolute;
    left: 10.66%;
    top: 63.01%;
    width: 25.46%;
    height: 35.61%;
    z-index: 2;
    -webkit-animation: fadein_mountain-left 1s;
    -moz-animation: fadein_mountain-left 1s;
    -ms-animation: fadein_mountain-left 1s;
    -o-animation: fadein_mountain-left 1s;
    animation: fadein_mountain-left 1s;
  }

  @keyframes fadein_mountain-left {
    from {
      opacity: 0;
      left: 10.66%;
      top: 90.4%;
    }

    to {
      opacity: 1;
      left: 10.66%;
      top: 63.01%;
    }
  }

  @-moz-keyframes fadein_mountain-left {
    from {
      opacity: 0;
      left: 10.66%;
      top: 90.4%;
    }

    to {
      opacity: 1;
      left: 10.66%;
      top: 63.01%;
    }
  }

  @-webkit-keyframes fadein_mountain-left {
    from {
      opacity: 0;
      left: 10.66%;
      top: 90.4%;
    }

    to {
      opacity: 1;
      left: 10.66%;
      top: 63.01%;
    }
  }

  @-ms-keyframes fadein_mountain-left {
    from {
      opacity: 0;
      left: 10.66%;
      top: 90.4%;
    }

    to {
      opacity: 1;
      left: 10.66%;
      top: 63.01%;
    }
  }

  #mountain-right {
    position: absolute;
    left: 58.66%;
    top: 54.79%;
    width: 30.66%;
    height: 44.38%;
    z-index: 3;
    -webkit-animation: fadein_mountain-right 1s;
    -moz-animation: fadein_mountain-right 1s;
    -ms-animation: fadein_mountain-right 1s;
    -o-animation: fadein_mountain-right 1s;
    animation: fadein_mountain-right 1s;
  }

  @keyframes fadein_mountain-right {
    from {
      opacity: 0;
      left: 58.66%;
      top: 82.19%;
    }

    to {
      opacity: 1;
      left: 58.66%;
      top: 54.79%;
    }
  }

  @-moz-keyframes fadein_mountain-right {
    from {
      opacity: 0;
      left: 58.66%;
      top: 82.19%;
    }

    to {
      opacity: 1;
      left: 58.66%;
      top: 54.79%;
    }
  }

  @-webkit-keyframes fadein_mountain-right {
    from {
      opacity: 0;
      left: 58.66%;
      top: 82.19%;
    }

    to {
      opacity: 1;
      left: 58.66%;
      top: 54.79%;
    }
  }

  @-ms-keyframes fadein_mountain-right {
    from {
      opacity: 0;
      left: 58.66%;
      top: 82.19%;
    }

    to {
      opacity: 1;
      left: 58.66%;
      top: 54.79%;
    }
  }

  #mountain-center {
    position: absolute;
    left: 24.8%;
    top: 45.47%;
    width: 48.53%;
    height: 66.3%;
    z-index: 5;
    -webkit-animation: fadein_mountain-center 1s;
    -moz-animation: fadein_mountain-center 1s;
    -ms-animation: fadein_mountain-center 1s;
    -o-animation: fadein_mountain-center 1s;
    animation: fadein_mountain-center 1s;
  }

  @keyframes fadein_mountain-center {
    from {
      opacity: 0;
      left: 24.8%;
      top: 72.87%;
    }

    to {
      opacity: 1;
      left: 24.8%;
      top: 45.47%;
    }
  }

  @-moz-keyframes fadein_mountain-center {
    from {
      opacity: 0;
      left: 24.8%;
      top: 72.87%;
    }

    to {
      opacity: 1;
      left: 24.8%;
      top: 45.47%;
    }
  }

  @-webkit-keyframes fadein_mountain-center {
    from {
      opacity: 0;
      left: 24.8%;
      top: 72.87%;
    }

    to {
      opacity: 1;
      left: 24.8%;
      top: 45.47%;
    }
  }

  @-ms-keyframes fadein_mountain-center {
    from {
      opacity: 0;
      left: 24.8%;
      top: 72.87%;
    }

    to {
      opacity: 1;
      left: 24.8%;
      top: 45.47%;
    }
  }

  #white-cloud-behind {
    position: absolute;
    left: 57.33%;
    top: 63.01%;
    width: 8.4%;
    height: 7.39%;
    z-index: 4;
    -webkit-animation:
      fadein_white-cloud-behind 1s ease-in,
      move_white-cloud-behind 1s linear 1s infinite alternate;
    -moz-animation:
      fadein_white-cloud-behind 1s ease-in,
      move_white-cloud-behind 1s linear 1s infinite alternate;
    -ms-animation:
      fadein_white-cloud-behind 1s ease-in,
      move_white-cloud-behind 1s linear 1s infinite alternate;
    -o-animation:
      fadein_white-cloud-behind 1s ease-in,
      move_white-cloud-behind 1s linear 1s infinite alternate;
    animation:
      fadein_white-cloud-behind 1s ease-in,
      move_white-cloud-behind 1s linear 1s infinite alternate;
  }

  @keyframes fadein_white-cloud-behind {
    from {
      opacity: 0;
      left: 57.33%;
      top: 90.41%;
    }

    to {
      opacity: 1;
      left: 57.33%;
      top: 63.01%;
    }
  }

  @-moz-keyframes fadein_white-cloud-behind {
    from {
      opacity: 0;
      left: 57.33%;
      top: 90.41%;
    }

    to {
      opacity: 1;
      left: 57.33%;
      top: 63.01%;
    }
  }

  @-webkit-keyframes fadein_white-cloud-behind {
    from {
      opacity: 0;
      left: 57.33%;
      top: 90.41%;
    }

    to {
      opacity: 1;
      left: 57.33%;
      top: 63.01%;
    }
  }

  @-ms-keyframes fadein_white-cloud-behind {
    from {
      opacity: 0;
      left: 57.33%;
      top: 90.41%;
    }

    to {
      opacity: 1;
      left: 57.33%;
      top: 63.01%;
    }
  }

  @keyframes move_white-cloud-behind {
    from {
      top: 63.01%;
    }

    to {
      top: 64.65%;
    }
  }

  @-moz-keyframes move_white-cloud-behind {
    from {
      top: 63.01%;
    }

    to {
      top: 64.65%;
    }
  }

  @-webkit-keyframes move_white-cloud-behind {
    from {
      top: 63.01%;
    }

    to {
      top: 64.65%;
    }
  }

  @-ms-keyframes move_white-cloud-behind {
    from {
      top: 63.01%;
    }

    to {
      top: 64.65%;
    }
  }

  #white-cloud-center {
    position: absolute;
    left: 31.33%;
    top: 73.97%;
    width: 9.86%;
    height: 9.04%;
    z-index: 6;
    -webkit-animation:
      fadein_white-cloud-center 1s ease-in,
      move_white-cloud-center 1s linear 1s infinite alternate;
    -moz-animation:
      fadein_white-cloud-center 1s ease-in,
      move_white-cloud-center 1s linear 1s infinite alternate;
    -ms-animation:
      fadein_white-cloud-center 1s ease-in,
      move_white-cloud-center 1s linear 1s infinite alternate;
    -o-animation:
      fadein_white-cloud-center 1s ease-in,
      move_white-cloud-center 1s linear 1s infinite alternate;
    animation:
      fadein_white-cloud-center 1s ease-in,
      move_white-cloud-center 1s linear 1s infinite alternate;
  }

  @keyframes fadein_white-cloud-center {
    from {
      opacity: 0;
      left: 31.33%;
      top: 101.36%;
    }

    to {
      opacity: 1;
      left: 31.33%;
      top: 73.97%;
    }
  }

  @-moz-keyframes fadein_white-cloud-center {
    from {
      opacity: 0;
      left: 31.33%;
      top: 101.36%;
    }

    to {
      opacity: 1;
      left: 31.33%;
      top: 73.97%;
    }
  }

  @-webkit-keyframes fadein_white-cloud-center {
    from {
      opacity: 0;
      left: 31.33%;
      top: 101.36%;
    }

    to {
      opacity: 1;
      left: 31.33%;
      top: 73.97%;
    }
  }

  @-ms-keyframes fadein_white-cloud-center {
    from {
      opacity: 0;
      left: 31.33%;
      top: 101.36%;
    }

    to {
      opacity: 1;
      left: 31.33%;
      top: 73.97%;
    }
  }

  @keyframes move_white-cloud-center {
    from {
      top: 73.97%;
    }

    to {
      top: 72.32%;
    }
  }

  @-moz-keyframes move_white-cloud-center {
    from {
      top: 73.97%;
    }

    to {
      top: 72.32%;
    }
  }

  @-webkit-keyframes move_white-cloud-center {
    from {
      top: 73.97%;
    }

    to {
      top: 72.32%;
    }
  }

  @-ms-keyframes move_white-cloud-center {
    from {
      top: 73.97%;
    }

    to {
      top: 72.32%;
    }
  }

  #white-cloud-left {
    position: absolute;
    left: -0.66%;
    top: 80.82%;
    width: 24%;
    height: 21.91%;
    z-index: 7;
    -webkit-animation: fadein_white-cloud-left 1s ease-in;
    -moz-animation: fadein_white-cloud-left 1s ease-in;
    -ms-animation: fadein_white-cloud-left 1s ease-in;
    -o-animation: fadein_white-cloud-left 1s ease-in;
    animation: fadein_white-cloud-left 1s ease-in;
  }

  @keyframes fadein_white-cloud-left {
    from {
      opacity: 0;
      left: -14%;
      top: 80.82%;
    }

    to {
      opacity: 1;
      left: -0.66%;
      top: 80.82%;
    }
  }

  @-moz-keyframes fadein_white-cloud-left {
    from {
      opacity: 0;
      left: -14%;
      top: 80.82%;
    }

    to {
      opacity: 1;
      left: -0.66%;
      top: 80.82%;
    }
  }

  @-webkit-keyframes fadein_white-cloud-left {
    from {
      opacity: 0;
      left: -14%;
      top: 80.82%;
    }

    to {
      opacity: 1;
      left: -0.66%;
      top: 80.82%;
    }
  }

  @-ms-keyframes fadein_white-cloud-left {
    from {
      opacity: 0;
      left: -14%;
      top: 80.82%;
    }

    to {
      opacity: 1;
      left: -0.66%;
      top: 80.82%;
    }
  }

  #white-cloud-right {
    position: absolute;
    left: 81.33%;
    top: 86.3%;
    width: 21.33%;
    height: 19.17%;
    z-index: 8;
    -webkit-animation: fadein_white-cloud-right 1s ease-in;
    -moz-animation: fadein_white-cloud-right 1s ease-in;
    -ms-animation: fadein_white-cloud-right 1s ease-in;
    -o-animation: fadein_white-cloud-right 1s ease-in;
    animation: fadein_white-cloud-right 1s ease-in;
  }

  @keyframes fadein_white-cloud-right {
    from {
      opacity: 0;
      left: 94.66%;
      top: 86.3%;
    }

    to {
      opacity: 1;
      left: 81.33%;
      top: 86.3%;
    }
  }

  @-moz-keyframes fadein_white-cloud-right {
    from {
      opacity: 0;
      left: 94.66%;
      top: 86.3%;
    }

    to {
      opacity: 1;
      left: 81.33%;
      top: 86.3%;
    }
  }

  @-webkit-keyframes fadein_white-cloud-right {
    from {
      opacity: 0;
      left: 94.66%;
      top: 86.3%;
    }

    to {
      opacity: 1;
      left: 81.33%;
      top: 86.3%;
    }
  }

  @-ms-keyframes fadein_white-cloud-right {
    from {
      opacity: 0;
      left: 94.66%;
      top: 86.3%;
    }

    to {
      opacity: 1;
      left: 81.33%;
      top: 86.3%;
    }
  }

  #blue-cloud-left {
    position: absolute;
    left: 0;
    top: 43.83%;
    width: 8.4%;
    height: 6.57%;
    z-index: 9;
    -webkit-animation: fadein_blue-cloud-left 1s ease-in;
    -moz-animation: fadein_blue-cloud-left 1s ease-in;
    -ms-animation: fadein_blue-cloud-left 1s ease-in;
    -o-animation: fadein_blue-cloud-left 1s ease-in;
    animation: fadein_blue-cloud-left 1s ease-in;
  }

  @keyframes fadein_blue-cloud-left {
    from {
      opacity: 0;
      left: -13.33%;
      top: 43.83%;
    }

    to {
      opacity: 1;
      left: 0;
      top: 43.83%;
    }
  }

  @-moz-keyframes fadein_blue-cloud-left {
    from {
      opacity: 0;
      left: -13.33%;
      top: 43.83%;
    }

    to {
      opacity: 1;
      left: 0;
      top: 43.83%;
    }
  }

  @-webkit-keyframes fadein_blue-cloud-left {
    from {
      opacity: 0;
      left: -13.33%;
      top: 43.83%;
    }

    to {
      opacity: 1;
      left: 0;
      top: 43.83%;
    }
  }

  @-ms-keyframes fadein_blue-cloud-left {
    from {
      opacity: 0;
      left: -13.33%;
      top: 43.83%;
    }

    to {
      opacity: 1;
      left: 0;
      top: 43.83%;
    }
  }

  #blue-cloud-right {
    position: absolute;
    left: 87.33%;
    top: 24.65%;
    width: 11.33%;
    height: 9.04%;
    z-index: 1;
    -webkit-animation: fadein_blue-cloud-right 1s ease-in;
    -moz-animation: fadein_blue-cloud-right 1s ease-in;
    -ms-animation: fadein_blue-cloud-right 1s ease-in;
    -o-animation: fadein_blue-cloud-right 1s ease-in;
    animation: fadein_blue-cloud-right 1s ease-in;
  }

  @keyframes fadein_blue-cloud-right {
    from {
      opacity: 0;
      left: 100.66%;
      top: 24.65%;
    }

    to {
      opacity: 1;
      left: 87.33%;
      top: 24.65%;
    }
  }

  @-moz-keyframes fadein_blue-cloud-right {
    from {
      opacity: 0;
      left: 100.66%;
      top: 24.65%;
    }

    to {
      opacity: 1;
      left: 87.33%;
      top: 24.65%;
    }
  }

  @-webkit-keyframes fadein_blue-cloud-right {
    from {
      opacity: 0;
      left: 100.66%;
      top: 24.65%;
    }

    to {
      opacity: 1;
      left: 87.33%;
      top: 24.65%;
    }
  }

  @-ms-keyframes fadein_blue-cloud-right {
    from {
      opacity: 0;
      left: 100.66%;
      top: 24.65%;
    }

    to {
      opacity: 1;
      left: 87.33%;
      top: 24.65%;
    }
  }

  #baloon {
    position: absolute;
    left: 25.33%;
    top: 13.69%;
    width: 12.26%;
    height: 38.08%;
    z-index: 11;
    -webkit-animation:
      fadein_baloon 1s,
      move_baloon 1s linear 1s infinite alternate;
    -moz-animation:
      fadein_baloon 1s,
      move_baloon 1s linear 1s infinite alternate;
    -ms-animation:
      fadein_baloon 1s,
      move_baloon 1s linear 1s infinite alternate;
    -o-animation:
      fadein_baloon 1s,
      move_baloon 1s linear 1s infinite alternate;
    animation:
      fadein_baloon 1s,
      move_baloon 1s linear 1s infinite alternate;
  }

  @keyframes fadein_baloon {
    from {
      left: 25.33%;
      top: 8.21%;
    }

    to {
      left: 25.33%;
      top: 13.69%;
    }
  }

  @-moz-keyframes fadein_baloon {
    from {
      left: 25.33%;
      top: 8.21%;
    }

    to {
      left: 25.33%;
      top: 13.69%;
    }
  }

  @-webkit-keyframes fadein_baloon {
    from {
      left: 25.33%;
      top: 8.21%;
    }

    to {
      left: 25.33%;
      top: 13.69%;
    }
  }

  @-ms-keyframes fadein_baloon {
    from {
      left: 25.33%;
      top: 8.21%;
    }

    to {
      left: 25.33%;
      top: 13.69%;
    }
  }

  @keyframes move_baloon {
    from {
      top: 13.69%;
    }

    to {
      top: 15.34%;
    }
  }

  @-moz-keyframes move_baloon {
    from {
      top: 13.69%;
    }

    to {
      top: 15.34%;
    }
  }

  @-webkit-keyframes move_baloon {
    from {
      top: 13.69%;
    }

    to {
      top: 15.34%;
    }
  }

  @-ms-keyframes move_baloon {
    from {
      top: 13.69%;
    }

    to {
      top: 15.34%;
    }
  }
`;

export default StyledErrorContainer;
