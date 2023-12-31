import styled, { css } from "styled-components";
import Heading from "@docspace/components/heading";
import TextInput from "@docspace/components/text-input";
import ComboBox from "@docspace/components/combobox";
import Box from "@docspace/components/box";
import DropDown from "@docspace/components/drop-down";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import HelpButton from "@docspace/components/help-button";
import Link from "@docspace/components/link";
import ToggleButton from "@docspace/components/toggle-button";
import { mobile } from "@docspace/components/utils/device";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";
import CrossIconMobile from "PUBLIC_DIR/images/cross.react.svg";
import DeleteIcon from "PUBLIC_DIR/images/mobile.actions.remove.react.svg";

import commonIconsStyles from "@docspace/components/utils/common-icons-style";

import Base from "@docspace/components/themes/base";

const fillAvailableWidth = css`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
`;

const StyledInvitePanel = styled.div`
  @media ${mobile} {
    user-select: none;
    height: auto;
    width: auto;
    background: ${(props) => props.theme.infoPanel.blurColor};
    backdrop-filter: blur(3px);
    z-index: 309;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    .invite_panel {
      background-color: ${(props) => props.theme.infoPanel.backgroundColor};
      border-left: ${(props) =>
        `1px solid ${props.theme.infoPanel.borderColor}`};
      position: absolute;
      border: none;
      right: 0;
      bottom: 0;
      height: calc(100% - 64px);
      width: 100vw;
      max-width: 100vw;
    }
  }

  .invite-panel-body {
    height: ${(props) =>
      props.hasInvitedUsers ? "calc(100% - 55px - 73px)" : "calc(100% - 55px)"};

    .scroll-body {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-left: 0px !important;
            `
          : css`
              padding-right: 0px !important;
            `}
    }

    ${(props) =>
      !props.addUsersPanelVisible &&
      props.theme.interfaceDirection !== "rtl" &&
      css`
        .trackYVisible {
          .scroller {
            margin-right: -20px !important;
          }
        }
      `}
  }

  ${(props) =>
    !props.scrollAllPanelContent &&
    css`
      .trackYVisible {
        .scroller {
          margin-right: -20px !important;
        }
      }
    `}
`;

const ScrollList = styled.div`
  width: 100%;
  height: ${(props) =>
    props.scrollAllPanelContent && props.isTotalListHeight
      ? "auto"
      : props.offsetTop && `calc(100% - ${props.offsetTop}px)`};
`;

const StyledBlock = styled.div`
  padding: ${(props) => (props.noPadding ? "0px" : "0 16px")};
  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};
`;

StyledBlock.defaultProps = { theme: Base };

const StyledHeading = styled(Heading)`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
`;

const StyledSubHeader = styled(Heading)`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  padding-left: 16px;
  padding-right: 16px;
  margin: 16px 0 8px 0;

  ${(props) =>
    props.inline &&
    css`
      display: inline-flex;
      align-items: center;
      gap: 16px;
    `};
`;

const StyledDescription = styled(Text)`
  padding-left: 16px;
  padding-right: 16px;
  color: ${(props) =>
    props.theme.createEditRoomDialog.commonParam.descriptionColor};
  margin-bottom: 16px;

  font-weight: 400;
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  line-height: 16px;
`;

StyledDescription.defaultProps = { theme: Base };

const StyledRow = styled.div`
  width: calc(100% - 32px) !important;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  min-height: 41px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 16px;
        `
      : css`
          margin-left: 16px;
        `}
  box-sizing: border-box;
  border-bottom: none;

  a {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: 16px;
  }

  .invite-panel_access-selector {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
            margin-left: 0;
          `
        : css`
            margin-left: auto;
            margin-right: 0;
          `}
  }

  .combo-button-label {
    color: ${(props) => props.theme.text.disableColor};
  }
  .combo-buttons_expander-icon path {
    fill: ${(props) => props.theme.text.disableColor};
  }
`;

const StyledInviteInput = styled.div`
  ${fillAvailableWidth}
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 16px;
          margin-left: ${(props) => (props.hideSelector ? "16px" : "8px")};
        `
      : css`
          margin-left: 16px;
          margin-right: ${(props) => (props.hideSelector ? "16px" : "8px")};
        `}
  
  
  .input-link {
    height: 32px;

    > input {
      height: 30px;
    }
  }
`;

const StyledAccessSelector = styled.div`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 16px;
        `
      : css`
          margin-right: 16px;
        `}
`;

const StyledEditInput = styled(TextInput)`
  width: 100%;
`;

const StyledComboBox = styled(ComboBox)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
        `
      : css`
          margin-left: auto;
        `}

  .combo-button-label,
  .combo-button-label:hover {
    text-decoration: none;
  }

  display: flex;
  align-items: center;
  justify-content: center;

  .combo-buttons_arrow-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 2px;
          `
        : css`
            margin-left: 2px;
          `}
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
  }
`;

const StyledDropDown = styled(DropDown)`
  ${(props) => props.width && `width: ${props.width}px`};

  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;

    .list-item_content {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
`;

const SearchItemText = styled(Text)`
  line-height: 16px;

  text-overflow: ellipsis;
  overflow: hidden;
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(
      props.primary ? "14px" : props.info ? "11px" : "12px"
    )};
  font-weight: ${(props) => (props.primary || props.info ? "600" : "400")};

  color: ${(props) =>
    (props.primary && !props.disabled) || props.info
      ? props.theme.text.color
      : props.theme.text.emailColor};
  ${(props) => props.info && `margin-left: auto`}
`;

SearchItemText.defaultProps = { theme: Base };

const StyledEditButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 0px;
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

const StyledCheckIcon = styled(CheckIcon)`
  ${iconStyles}
`;

StyledCheckIcon.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossIcon)`
  ${iconStyles}
`;

StyledCrossIcon.defaultProps = { theme: Base };

const StyledDeleteIcon = styled(DeleteIcon)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
        `
      : css`
          margin-left: auto;
        `}

  ${iconStyles}
`;

StyledDeleteIcon.defaultProps = { theme: Base };

const StyledHelpButton = styled(HelpButton)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 8px;
        `
      : css`
          margin-right: 8px;
        `}
`;

const StyledButtons = styled(Box)`
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

const StyledLink = styled(Link)`
  float: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left` : `right`};
`;

const ResetLink = styled(Link)`
  float: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right` : `left`};
  padding: 0 16px;
  margin-bottom: 16px;
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  color: ${(props) => props.theme.createEditRoomDialog.commonParam.textColor};
  font-style: normal;
  line-height: 15px;
`;

StyledButtons.defaultProps = { theme: Base };

const StyledToggleButton = styled(ToggleButton)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          left: 8px;
        `
      : css`
          right: 8px;
        `}
  margin-top: -4px;
`;

const StyledControlContainer = styled.div`
  width: 17px;
  height: 17px;
  position: absolute;

  cursor: pointer;

  align-items: center;
  justify-content: center;
  z-index: 450;

  @media ${mobile} {
    display: flex;

    top: -27px;
    right: 10px;
    left: unset;
  }
`;
const StyledInviteLanguage = styled.div`
  padding-left: 16px;
  padding-right: 16px;
  margin-top: -12px;
  display: flex;
  align-items: center;
  justify-content: start;
  height: 28px;
  color: ${(props) =>
    props.theme.createEditRoomDialog.commonParam.descriptionColor};
  margin-bottom: 4px;
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  .list-link {
    margin-left: 4px;
    color: ${(props) => props.theme.createEditRoomDialog.commonParam.textColor};
  }

  .invitation-language {
    color: ${(props) =>
      props.theme.createEditRoomDialog.commonParam.descriptionColor};
  }
  .language-combo-box {
    .combo-button {
      padding-left: 6px;
      padding-right: 6px;
    }
    .combo-button-label {
      color: ${(props) =>
        props.theme.createEditRoomDialog.commonParam.descriptionColor};
    }
    .combo-buttons_arrow-icon {
      margin-left: 0px;
      svg {
        path {
          fill: ${(props) =>
            props.theme.createEditRoomDialog.commonParam.descriptionColor};
        }
      }
    }
  }
`;
const StyledCrossIconMobile = styled(CrossIconMobile)`
  width: 17px;
  height: 17px;
  z-index: 455;
  path {
    fill: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };
export {
  StyledBlock,
  StyledHeading,
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
  ResetLink,
  ScrollList,
  StyledAccessSelector,
  StyledToggleButton,
  StyledDescription,
  StyledInviteLanguage,
  StyledControlContainer,
  StyledCrossIconMobile,
};
