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

import { Box } from "../box";
import { tablet } from "../../utils";
import { globalColors } from "../../themes";

const StyledIframe = styled.iframe<{ sectionWidth: number }>`
  border: none;
  height: 60px;
  width: 100%;

  @media ${tablet} {
    min-width: ${(props) => `${props.sectionWidth + 40}px`};
  }
`;

const StyledSnackBar = styled(Box)<{
  opacity?: number;
  backgroundColor: string;
  backgroundImg?: string;
  textalign?: string;
}>`
  transition: all 500ms ease;
  transition-property: top, right, bottom, left, opacity;
  font-family: ${(props) => props.theme.fontFamily};
  font-size: 12px;
  min-height: 14px;
  position: relative;
  display: flex;
  align-items: flex-start;
  color: white;
  line-height: 16px;
  padding: 12px 20px;
  margin: 0;
  opacity: ${(props) => props.opacity || 0};
  width: 100%;
  background-color: ${(props) => props.backgroundColor};
  background-image: url(${(props) => props.backgroundImg || ""});

  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: ${(props) => props.textalign};

    .header-body {
      width: 100%;
      height: fit-content;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      justify-content: start;

      .text-header {
        font-size: 12px;
        line-height: 16px;
        font-weight: 600;

        margin: 0;
      }
    }

    .text-body {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: ${(props) => props.textalign};

      .text {
        font-size: 12px;
        line-height: 16px;
        font-weight: 400;
      }
    }
  }

  .action {
    background: inherit;
    display: inline-block;
    border: none;
    font-size: inherit;
    color: ${globalColors.black};
    margin-block: 0 4px;
    margin-inline: 24px 4px;

    padding: 0;

    min-width: min-content;
    cursor: pointer;
    margin-inline-start: 12px;
    text-decoration: underline;
  }

  .button {
    background: inherit;
    border: none;
    font-size: 13px;
    color: ${globalColors.darkBlack};
    cursor: pointer;
    line-height: 14px;

    text-decoration: underline;
  }
`;

const StyledAction = styled.div`
  position: absolute;
  // doesn't require mirroring for RTL
  right: 8px;
  top: 8px;
  background: inherit;
  display: inline-block;
  border: none;
  font-size: inherit;
  color: ${globalColors.black};
  cursor: pointer;
  text-decoration: underline;
  @media ${tablet} {
    // doesn't require mirroring for RTL
    right: 14px;
  }
`;

export { StyledAction, StyledSnackBar, StyledIframe };
