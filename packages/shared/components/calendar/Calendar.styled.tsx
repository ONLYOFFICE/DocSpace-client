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
import { TColorScheme } from "../../themes/base";
import { injectDefaultTheme } from "../../utils";

const ArrowIcon = styled.span.attrs(injectDefaultTheme)<{
  next?: boolean;
  isMobile?: boolean;
  previous?: boolean;
}>`
  position: absolute;
  border-left: 2px solid;
  border-bottom: 2px solid;
  width: 5px;
  height: 5px;

  ${(props) =>
    props.next &&
    (props.isMobile
      ? css`
          transform: rotate(-45deg);
          top: 11.5px;
          left: 12.5px;
        `
      : css`
          transform: rotate(-45deg);
          top: 9px;
          left: 9.5px;
        `)}

  ${(props) =>
    props.previous &&
    (props.isMobile
      ? css`
          transform: rotate(135deg);
          top: 14px;
          left: 12.5px;
        `
      : css`
          transform: rotate(135deg);
          top: 11px;
          left: 9.5px;
        `)}
`;

const ButtonsContainer = styled.div`
  display: flex;
`;

ButtonsContainer.displayName = "ButtonsContainer";

const CalendarContainer = styled.div.attrs(injectDefaultTheme)<{
  isMobile?: boolean;
  big?: boolean;
  isScroll?: boolean;
}>`
  ${(props) =>
    !props.isMobile &&
    css`
      width: 306px;
      height: 276px;
    `}

  box-sizing: border-box;

  display: grid;
  row-gap: ${(props) =>
    props.big
      ? props.isMobile
        ? "26.7px"
        : "10px"
      : props.isMobile
        ? "9px"
        : "0"};
  column-gap: ${(props) =>
    props.big
      ? props.isMobile
        ? "8%"
        : "31.33px"
      : props.isMobile
        ? "2%"
        : "14px"};
  grid-template-columns: ${(props) =>
    props.big ? "repeat(4, 1fr)" : "repeat(7, 1fr)"};
  box-sizing: border-box;
  padding: ${(props) => (props.big ? "14px 6px 6px 6px" : "0 6px")};
  ${(props) =>
    props.isScroll &&
    css`
      margin-bottom: 28px;
    `};
`;

const Container = styled.div.attrs(injectDefaultTheme)<{
  isMobile?: boolean;
  isScroll?: boolean;
}>`
  box-sizing: border-box;
  width: ${(props) => (props.isMobile ? "100%" : "362px")};
  height: ${(props) => (props.isMobile ? "420px" : "376px")};
  padding: ${(props) =>
    props.isMobile
      ? "16px"
      : props.isScroll
        ? "0px 0px 0px 28px"
        : "30px 28px 28px 28px"};
  box-shadow: ${(props) => props.theme.calendar.boxShadow};
  border-radius: 6px;
  z-index: 320;
  background-color: ${(props) => props.theme.backgroundColor};

  ${(props) =>
    props.isScroll &&
    css`
      header {
        padding: 30px 23px 0 12px !important;
      }
    `};
`;

const DateItem = styled.button.attrs(injectDefaultTheme)<{
  isMobile?: boolean;
  big?: boolean;
  isCurrent?: boolean;
  focused: boolean;
  isSecondary?: boolean;
}>`
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: 600;
  font-size: ${(props) => (props.isMobile ? "16px" : "13px")};
  border-radius: 50%;

  border: 2px solid;
  background-color: transparent;

  width: ${(props) =>
    props.big
      ? props.isMobile
        ? "60px"
        : "50px"
      : props.isMobile
        ? "40px"
        : "30px"};
  height: ${(props) =>
    props.big
      ? props.isMobile
        ? "60px"
        : "50px"
      : props.isMobile
        ? "40px"
        : "30px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  :hover {
    cursor: ${(props) => (props.disabled ? "default" : "pointer")};
    background: ${(props) =>
      props.disabled ? "transparent" : props.theme.calendar.onHoverBackground};
  }

  ${(props) =>
    props.isCurrent &&
    css`
      background: ${props.theme.calendar?.accent};
      :hover {
        background-color: ${props.theme.calendar?.accent};
      }

      :focus {
        background-color: ${props.theme.calendar?.accent};
      }
    `}
  color: ${(props) =>
    props.disabled
      ? props.theme.calendar.disabledColor
      : props.focused
        ? props.theme.calendar?.accent
        : props.theme.calendar.color};
  border-color: ${(props) =>
    props.focused ? props.theme.calendar?.accent : "transparent"};

  ${(props) =>
    props.isCurrent &&
    css`
      color: white !important;

      :hover {
        color: white !important;
      }

      :focus {
        color: white !important;
      }
    `}
  ${(props) =>
    props.isSecondary &&
    css`
      color: ${props.disabled
        ? props.theme.calendar.disabledColor
        : props.theme.calendar.pastColor} !important;

      :hover {
        cursor: ${props.disabled ? "auto" : "pointer"};
        color: ${props.disabled
          ? props.theme.calendar.disabledColor
          : props.theme.calendar.pastColor} !important;
      }
    `}
`;

const HeaderActionIcon = styled(ArrowIcon).attrs(injectDefaultTheme)`
  width: ${(props) => (props.isMobile ? "5px" : "6px")};
  height: ${(props) => (props.isMobile ? "5px" : "6px")};
  transform: rotate(225deg);
  top: ${(props) => (props.isMobile ? "11px" : "8.5px")};
  left: 104%;
  border-color: ${(props) => props.theme.calendar?.accent};
`;

const HeaderContainer = styled.header`
  width: 100%;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 16px;
`;

const RoundButton = styled.button.attrs(injectDefaultTheme)<{
  isMobile?: boolean;
}>`
  width: ${(props) => (props.isMobile ? "32px" : "26px")};
  height: ${(props) => (props.isMobile ? "32px" : "26px")};

  box-sizing: border-box;

  border-radius: 50%;
  outline: 1px solid;
  outline-color: ${(props) => props.theme.calendar?.outlineColor};
  border: none;
  background-color: transparent;
  position: relative;

  transition: all ease-in-out 0.05s;

  span {
    border-color: ${(props) =>
      props.disabled
        ? props.theme.calendar.disabledArrow
        : props.theme.calendar.arrowColor};
  }

  :hover {
    cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
    outline: ${(props) =>
      props.disabled
        ? `1px solid ${props.theme.calendar?.outlineColor}`
        : `2px solid ${props.theme.calendar?.accent}`};
    span {
      border-color: ${(props) =>
        props.disabled
          ? props.theme.calendar.disabledArrow
          : props.theme.calendar?.accent};
    }
  }
`;

const Title = styled.h2.attrs(injectDefaultTheme)<{
  isMobile?: boolean;
  disabled?: boolean;
}>`
  position: relative;
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: 700;
  font-size: ${(props) => (props.isMobile ? "21px" : "18px")};
  line-height: ${(props) => (props.isMobile ? "28px" : "24px")};
  color: ${(props) => props.theme.calendar.titleColor};
  border-bottom: 1px dashed transparent;
  margin: 0;
  display: inline-block;

  :hover {
    border-color: ${(props) =>
      props.disabled ? "transparent" : props.theme.calendar.titleColor};
    cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
  }
`;

const Weekday = styled.span.attrs(injectDefaultTheme)<{ isMobile?: boolean }>`
  pointer-events: none;
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: 400;
  font-size: ${(props) => (props.isMobile ? "16px" : "13px")};
  line-height: 16px;

  color: ${(props) => props.theme.calendar.weekdayColor};
  width: ${(props) => (props.isMobile ? "40px" : "30px")};

  text-align: center;
  padding: 10.7px 0;
`;

const StyledContainerTheme = styled(Container)<{
  $currentColorScheme?: TColorScheme;
  isMobile?: boolean;
  isScroll?: boolean;
}>`
  ${HeaderActionIcon} {
    border-color: ${(props) => props.$currentColorScheme?.main?.accent};
  }

  border: 1px solid ${({ theme }) => theme.calendar.containerBorderColor};
`;

const StyledDateItemTheme = styled(DateItem)<{
  $currentColorScheme?: TColorScheme;
  isMobile?: boolean;
  focused?: boolean;
}>`
  ${(props) =>
    props.isCurrent &&
    css`
      background: ${props.$currentColorScheme?.main?.accent};
      :hover {
        background-color: ${props.$currentColorScheme?.main?.accent};
      }

      :focus {
        background-color: ${props.$currentColorScheme?.main?.accent};
      }
    `}
  color: ${(props) =>
    props.disabled
      ? props.theme.calendar.disabledColor
      : props.focused
        ? props.$currentColorScheme?.main?.accent
        : props.theme.calendar.color};
  border-color: ${(props) =>
    props.focused ? props.$currentColorScheme?.main?.accent : "transparent"};
`;

const StyledRoundButtonTheme = styled(RoundButton)<{
  $currentColorScheme?: TColorScheme;
}>`
  :hover {
    outline: ${(props) =>
      props.disabled
        ? `1px solid ${props.theme.calendar?.outlineColor}`
        : `2px solid ${props.$currentColorScheme?.main?.accent}`};
    span {
      border-color: ${(props) =>
        props.disabled
          ? props.theme.calendar.disabledArrow
          : props.$currentColorScheme?.main?.accent};
    }
  }
`;

export {
  ButtonsContainer,
  Weekday,
  Title,
  ArrowIcon,
  CalendarContainer,
  Container,
  DateItem,
  HeaderActionIcon,
  HeaderContainer,
  RoundButton,
  StyledContainerTheme,
  StyledDateItemTheme,
  StyledRoundButtonTheme,
};
