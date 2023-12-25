import styled, { css } from "styled-components";
import { Base } from "../../themes";
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
      right: 0;
      left: 0;
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
        fill: #657077;
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
    margin-right: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 0px;
        margin-left: 8px;
      `}
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
    left: 0;
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
