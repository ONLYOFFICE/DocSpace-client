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
import { globalColors } from "../../themes";
import { mobileMore, mobile, injectDefaultTheme } from "../../utils";

const displaySettings = css<{
  hasScroll?: boolean;
  showReminder?: boolean;
  hideBorder?: boolean;
}>`
  position: absolute;
  display: block;
  flex-direction: column-reverse;
  align-items: flex-start;
  border-top: ${(props) =>
    props.hasScroll && !props.showReminder && !props.hideBorder
      ? `1px solid ${globalColors.grayLightMid}`
      : "none"};

  ${(props) =>
    props.hasScroll &&
    css`
      bottom: auto;
    `}

  .buttons-flex {
    display: flex;
    width: 100%;

    box-sizing: border-box;

    @media ${mobile} {
      padding: 16px;
      bottom: 0;
    }
  }

  .unsaved-changes {
    position: absolute;
    padding-top: 16px;
    padding-bottom: 16px;
    font-size: 12px;
    font-weight: 600;
    width: calc(100% - 32px);
    bottom: 56px;
    background-color: ${(props) =>
      props.hasScroll
        ? props.theme.mainButtonMobile.buttonWrapper.background
        : "none"};

    @media ${mobile} {
      padding-inline-start: 16px;
    }
  }

  ${(props) =>
    props.showReminder &&
    props.hasScroll &&
    css`
      .unsaved-changes {
        border-top: 1px solid ${globalColors.grayLightMid};
        width: calc(100% - 16px);

        inset-inline-start: 0;
        padding-inline-start: 16px;
      }
    `}
`;

const tabletButtons = css`
  position: static;
  display: flex;
  max-width: none;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  border-top: none;

  .buttons-flex {
    width: auto;
  }

  .unsaved-changes {
    border-top: none;
    position: static;
    padding: 0;
    margin-bottom: 0;
    margin-inline-start: 8px;
  }
`;

const StyledSaveCancelButtons = styled.div.attrs(injectDefaultTheme)<{
  displaySettings?: boolean;
  showReminder?: boolean;
  hasScroll?: boolean;
  hideBorder?: boolean;
}>`
  display: flex;
  position: absolute;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: center;
  bottom: ${(props) => props.theme.saveCancelButtons.bottom};
  width: ${(props) => props.theme.saveCancelButtons.width};
  background-color: ${({ theme }) => theme.backgroundColor};

  inset-inline-start: ${({ theme }) => theme.saveCancelButtons.left};

  .save-button {
    margin-inline-end: ${({ theme }) => theme.saveCancelButtons.marginRight};
  }
  .unsaved-changes {
    color: ${(props) => props.theme.saveCancelButtons.unsavedColor};
  }

  ${(props) => props.displaySettings && displaySettings};

  @media ${mobileMore} {
    ${(props) => props.displaySettings && tabletButtons}
    ${(props) =>
      !props.displaySettings &&
      css`
        justify-content: flex-end;
        position: fixed;

        .unsaved-changes {
          display: none;
        }
      `}
  }

  @media ${mobile} {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    ${({ showReminder }) =>
      showReminder &&
      css`
        padding-top: 30px;
      `}
  }
`;

export default StyledSaveCancelButtons;
