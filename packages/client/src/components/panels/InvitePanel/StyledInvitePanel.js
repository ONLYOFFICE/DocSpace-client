// (c) Copyright Ascensio System SIA 2009-2025
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
import { Heading } from "@docspace/shared/components/heading";
import { TextInput } from "@docspace/shared/components/text-input";
import { ComboBox } from "@docspace/shared/components/combobox";
import { DropDown } from "@docspace/shared/components/drop-down";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Link } from "@docspace/shared/components/link";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import {
  mobile,
  commonIconsStyles,
  injectDefaultTheme,
  desktop,
  commonInputStyles,
} from "@docspace/shared/utils";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";
import DeleteIcon from "PUBLIC_DIR/images/mobile.actions.remove.react.svg";
import { globalColors } from "@docspace/shared/themes";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";

const fillAvailableWidth = css`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;
`;

const StyledInvitePanel = styled.div`
  @media ${mobile} {
    user-select: none;
    height: auto;
    width: auto;
    background: ${(props) => props.theme.infoPanel.blurColor};
    z-index: 309;
    position: fixed;
    inset: 0;

    .invite_panel {
      background-color: ${(props) => props.theme.infoPanel.backgroundColor};
      position: absolute;
      border: none;
      inset-inline-end: 0;
      bottom: 0;
      height: calc(100% - 64px);
      width: 100vw;
      max-width: 100vw;
    }
  }

  .invite-panel-body {
    height: calc(100% - 55px - 73px);

    .scroll-body {
      padding-inline-end: 0 !important;

      @media ${desktop} {
        width: 480px;
        min-width: auto !important;
      }
    }
  }
`;

const ScrollList = styled.div.attrs((props) => ({
  "data-testid": props.dataTestId,
}))`
  position: absolute;

  width: 100%;
  height: ${(props) =>
    props.scrollAllPanelContent && props.isTotalListHeight
      ? "auto"
      : props.offsetTop && `calc(100% - ${props.offsetTop}px)`};

  .row-item {
    @media not ${mobile} {
      width: 448px !important;
    }
  }
`;

const StyledExternalLink = styled.div`
  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};
`;
const StyledInviteUserBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;

  .invite-user-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-name {
    padding-top: 8px;
  }

  .about-label {
    color: ${(props) => props.theme.filesPanels.invite.textColor};
  }
`;

const StyledSubHeader = styled(Heading)`
  font-weight: 700 !important;
  font-size: 16px !important;
  margin: 16px 0 8px;

  ${(props) =>
    props.$inline &&
    css`
      display: inline-flex;
      align-items: center;
      gap: 16px;
    `};
`;

const StyledDescription = styled(Text).attrs(injectDefaultTheme)`
  color: ${(props) =>
    props.theme.createEditRoomDialog.commonParam.descriptionColor};
  margin-bottom: 16px;

  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  ${(props) =>
    props.noAllowInvitingGuests &&
    css`
      margin-bottom: 12px;
    `};
`;

const StyledRow = styled.div.attrs((props) => ({
  "data-testid": props.dataTestId,
}))`
  display: grid;
  grid-template-columns: ${(props) =>
    props.edit ? "32px 1fr 32px 32px" : "32px 1fr auto"};
  gap: 8px;

  min-height: 41px;

  box-sizing: border-box;
  border-bottom: none;

  a {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
  }

  .access-selector {
    margin-inline-start: auto;
    margin-inline-end: 0;

    ${({ hasWarning }) => hasWarning && `margin-inline-start: 0;`}
  }

  .warning {
    margin-inline-start: auto;
  }

  .role-access {
    box-sizing: border-box;
    display: flex;
    align-items: right;
    gap: 8px;

    .role-warning {
      padding-top: 4px;
    }
  }
`;

const StyledInviteInput = styled.div`
  ${fillAvailableWidth}

  margin-inline-end: ${(props) => (props.hideSelector ? "16px" : "8px")};

  .input-link {
    height: 32px;
    border: 0px;

    > input {
      height: 30px;
    }
  }

  display: flex;
  border: ${(props) => props.theme.filesPanels.invite.border};
  border-radius: 3px;

  .copy-link-icon {
    padding: 0;

    &:hover {
      svg path {
        fill: ${(props) => props.theme.inputBlock.hoverIconColor} !important;
      }
    }

    svg path {
      fill: ${(props) => props.theme.inputBlock.iconColor} !important;
    }
  }

  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  .append {
    display: ${(props) => (props.isShowCross ? "flex" : "none")};
    align-items: center;
    padding-inline-end: 8px;
    cursor: default;
  }

  ${commonInputStyles}

  :focus-within {
    border-color: ${(props) => props.theme.inputBlock.borderColor};
  }
`;

const StyledEditInput = styled(TextInput).attrs((props) => ({
  "data-testid": props.dataTestId,
}))`
  height: 32px;
`;

const StyledComboBox = styled(ComboBox)`
  margin-inline-start: auto;

  .combo-button-label,
  .combo-button-label:hover {
    text-decoration: none;
  }

  display: flex;
  align-items: center;
  justify-content: center;

  .combo-buttons_arrow-icon {
    margin-inline-start: 2px;
  }

  padding: 0px;

  .combo-button {
    border-radius: 3px;
  }
`;

const StyledInviteInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;

  .header_aside-panel {
    max-width: 100% !important;

    .selector_body_tabs {
      display: flex;
      justify-content: left;
      margin-bottom: 16px;
      padding: 0;
      width: -webkit-fill-available;

      .sticky-indent {
        height: 0;
      }

      .sticky {
        .scroll-body {
          overflow-x: hidden;
        }
        .scroll-body > div {
          justify-content: flex-start;
          padding-inline-start: 16px;
        }
      }
    }
  }

  .access-selector {
    margin-inline-end: 0;

    // Add space between access-selector's absolute positioned dropdown and modal footer
    .dropdown-container {
      overflow: unset;

      ::after {
        content: "";
        position: absolute;
        top: 100%;
        width: 100%;
        height: ${ASIDE_PADDING_AFTER_LAST_ITEM};
      }
    }
  }

  .add-manually-dropdown {
    inset-inline-start: 0;
    border: ${`1px solid ${globalColors.grayStrong}`};
  }
`;

const StyledDropDown = styled(DropDown)`
  ${(props) => props.width && `width: ${props.width}px`};

  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 53px;

    .item-avatar {
      svg path {
        fill: var(--info-panel-role-color);
      }
    }

    .avatar-disabled {
      opacity: 0.5;
    }

    .list-item_content {
      text-overflow: ellipsis;
      overflow: hidden;

      .list-item_content-box {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .email-list_avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }

    .email-list_email-container {
      display: flex;
      flex-direction: column;
      gap: 0;
      line-height: 16px;

      .email-list_invite-as-guest {
        color: ${(props) => props.theme.currentColorScheme.main.accent};
      }
    }

    .email-list_add-button {
      display: flex;
      margin-inline-start: auto;
      align-items: center;
      gap: 4px;

      svg {
        ${({ theme }) =>
          theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"};

        path {
          fill: ${(props) => props.theme.inputBlock.iconColor};
          ${(props) =>
            props.isRequestRunning &&
            css`
              opacity: 0.65;
            `}
        }
      }
    }
  }

  .no-users-list {
    height: 23px;
    padding-left: 8px;
    padding-top: 2px;
  }
`;

const SearchItemText = styled(Text).attrs(injectDefaultTheme)`
  line-height: 16px;

  text-overflow: ellipsis;
  overflow: hidden;
  font-size: ${(props) =>
    props.$primary ? "14px" : props.$info ? "11px" : "12px"};
  font-weight: ${(props) => (props.$primary || props.$info ? "600" : "400")};

  color: ${(props) =>
    (props.$primary && !props.disabled) || props.$info
      ? props.theme.text.color
      : props.theme.text.emailColor};
  ${(props) => props.info && `margin-inline-start: auto`}
`;

const StyledEditButton = styled(Button).attrs((props) => ({
  "data-testid": props.dataTestId,
}))`
  width: 32px !important;
  height: 32px !important;
  padding: 0px !important;
`;

const iconStyles = css`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesEditingWrapper.fill} !important;
  }
  :hover {
    fill: ${(props) => props.theme.filesEditingWrapper.hoverFill} !important;
  }
`;

const StyledCheckIcon = styled(CheckIcon).attrs(injectDefaultTheme)`
  ${iconStyles}
`;

const StyledCrossIcon = styled(CrossIcon).attrs(injectDefaultTheme)`
  ${iconStyles}
`;

const StyledDeleteIcon = styled(DeleteIcon).attrs((props) => ({
  ...injectDefaultTheme(props),
  "data-testid": props.dataTestId,
}))`
  cursor: pointer;

  ${iconStyles}
`;

const StyledHelpButton = styled(HelpButton)`
  margin-inline-start: 8px;
`;

const StyledButtons = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  position: absolute;
  bottom: 0px;
  width: 100%;
  background: ${(props) => props.theme.filesPanels.sharing.backgroundButtons};
  border-top: ${(props) => props.theme.filesPanels.sharing.borderTop};
`;

const StyledLink = styled(Link).attrs((props) => ({
  "data-testid": props.dataTestId,
}))`
  float: inline-end;
`;

const StyledToggleButton = styled(ToggleButton)`
  inset-inline-end: 8px;
  margin-top: -4px;
`;

const StyledInviteLanguage = styled.div`
  margin-top: -12px;
  display: flex;
  align-items: center;
  justify-content: start;
  height: 28px;
  color: ${(props) =>
    props.theme.createEditRoomDialog.commonParam.descriptionColor};
  margin-bottom: 4px;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  .list-link {
    margin-inline-start: 4px;
    color: ${(props) => props.theme.createEditRoomDialog.commonParam.textColor};
  }

  .invitation-language {
    color: ${(props) =>
      props.theme.createEditRoomDialog.commonParam.descriptionColor};
  }
  .language-combo-box {
    .combo-button {
      padding-inline: 6px;
    }

    .combo-buttons_arrow-icon {
      margin-inline-start: 0;
    }

    .combo-button_closed:not(:hover) .combo-button-label {
      color: ${(props) => props.theme.linkWithDropdown.color.active};
    }
    .combo-button_closed:not(:hover) .combo-buttons_arrow-icon {
      svg {
        path {
          fill: ${(props) => props.theme.linkWithDropdown.color.active};
        }
      }
    }
  }

  .language-combo-box-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  margin-inline-start: auto;

  @media ${mobile} {
    margin-inline-end: 16px;
  }
`;

export {
  StyledInvitePanel,
  StyledRow,
  StyledSubHeader,
  StyledInviteInput,
  StyledComboBox,
  StyledInviteInputContainer,
  StyledDropDown,
  SearchItemText,
  StyledEditInput,
  StyledEditButton,
  StyledCheckIcon,
  StyledCrossIcon,
  StyledHelpButton,
  StyledDeleteIcon,
  StyledButtons,
  StyledLink,
  ScrollList,
  StyledToggleButton,
  StyledDescription,
  StyledInviteLanguage,
  StyledInviteUserBody,
  StyledExternalLink,
  ErrorWrapper,
};
