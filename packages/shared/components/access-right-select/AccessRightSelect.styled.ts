import styled, { css } from "styled-components";

import { Base } from "../../themes";
import { mobile } from "../../utils";

import { ComboBox } from "../combobox";

const StyledWrapper = styled(ComboBox)`
  .combo-button {
    padding-left: 16px;
    padding-right: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        padding-left: 8px;
        padding-right: 16px;
      `}
  }

  @media ${mobile} {
    .backdrop-active {
      top: -64px;
      z-index: 560;
    }
    .dropdown-container {
      z-index: 561;
    }
  }
`;

StyledWrapper.defaultProps = { theme: Base };

const StyledItem = styled.div`
  width: auto;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: center;

  padding: 7px 0px;

  line-height: 16px;
  font-style: normal;
`;

StyledItem.defaultProps = { theme: Base };

const StyledItemDescription = styled.div`
  margin: 1px 0px;

  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: ${(props) => props.theme.accessRightSelect.descriptionColor};
`;

StyledItemDescription.defaultProps = { theme: Base };

const StyledItemIcon = styled.img`
  margin-right: 8px;
`;

const StyledItemContent = styled.div`
  width: 100%;
  white-space: normal;
`;

const StyledItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export {
  StyledItemTitle,
  StyledItemContent,
  StyledItemIcon,
  StyledItemDescription,
  StyledItem,
  StyledWrapper,
};
