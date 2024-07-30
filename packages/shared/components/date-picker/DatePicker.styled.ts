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
import { Base, globalColors } from "../../themes";
import { mobile } from "../../utils";

import { Calendar } from "../calendar";

const DateInputStyle = styled.div`
  width: ${(props) => props.theme.datePicker.width};
`;
DateInputStyle.defaultProps = { theme: Base };

const DropDownStyle = styled.div`
  .drop-down {
    > div {
      > div {
        margin: auto;
      }
      margin: auto;
    }
    padding: ${(props) => props.theme.datePicker.dropDownPadding};

    @media ${mobile} {
      position: fixed;
      top: unset;
      inset-inline: 0;
      bottom: 0;
      width: 100%;
      width: -moz-available;
      width: -webkit-fill-available;
      width: fill-available;
      border: none;
      border-radius: 6px 6px 0px 0px;
    }
  }

  .backdrop-active {
    z-index: 210;
  }

  position: relative;
`;
DropDownStyle.defaultProps = { theme: Base };

const Content = styled.div`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  background-color: ${(props) => props.theme.datePicker.backgroundColor};
  padding: ${(props) => props.theme.datePicker.contentPadding};

  .header {
    max-width: ${(props) => props.theme.datePicker.contentMaxWidth};
    margin: 0;
    line-height: ${(props) => props.theme.datePicker.contentLineHeight};
    font-weight: ${(props) =>
      props.theme.datePicker.contentFontWeight} !important;
  }
`;
Content.defaultProps = { theme: Base };

const Header = styled.div`
  display: flex;
  align-items: center;
  border-bottom: ${(props) => props.theme.datePicker.borderBottom};
`;
Header.defaultProps = { theme: Base };

const Body = styled.div`
  position: relative;
  padding: ${(props) => props.theme.datePicker.bodyPadding};
`;
Body.defaultProps = { theme: Base };

const Wrapper = styled.div`
  .selectedItem {
    cursor: pointer;
    .calendarIcon {
      width: 12px;
      height: 12px;
      padding: 0 10px 0 2px;
      path {
        fill: ${globalColors.lightGrayDark};
      }
    }
  }
`;

const DateSelector = styled.div`
  width: fit-content;
  cursor: pointer;

  display: flex;
  align-items: center;

  .mr-8 {
    margin-inline-end: 8px;
  }
`;

const SelectedLabel = styled.span`
  display: flex;
  align-items: center;
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;

  @media ${mobile} {
    position: fixed;
    bottom: 0;
    inset-inline-start: 0;
  }
`;

export {
  Body,
  Header,
  Content,
  DropDownStyle,
  DateInputStyle,
  Wrapper,
  SelectedLabel,
  StyledCalendar,
  DateSelector,
};
