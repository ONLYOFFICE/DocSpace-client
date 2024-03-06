import styled from "styled-components";
import { Base } from "../../themes";
import { tablet, mobile } from "../../utils";

const StyledPaging = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .prev-button,
  .next-button {
    font-size: 13px;
    line-height: 20px;
    padding: 6px 28px;
  }

  .prev-button {
    max-width: 111px;
  }

  .next-button {
    max-width: 86px;
  }

  @media ${tablet} {
    .prev-button,
    .next-button {
      font-size: 14px;
    }

    .prev-button {
      max-width: 115px;
      height: 40px;
    }

    .next-button {
      max-width: 89px;
      height: 40px;
    }
  }

  & > button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: ${theme.paging.button.marginRight};`
        : `margin-right: ${theme.paging.button.marginRight};`}
  }
`;
StyledPaging.defaultProps = { theme: Base };

const StyledOnPage = styled.div`
  width: 125px;

  @media ${tablet} {
    width: 125px;
    height: 40px;
  }

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `
        margin-right: ${theme.paging.comboBox.marginLeft};
        margin-left: ${theme.paging.comboBox.marginRight};
      `
      : `
        margin-left: ${theme.paging.comboBox.marginLeft};
        margin-right: ${theme.paging.comboBox.marginRight};
      `}

  .hideDisabled {
    padding: 0;

    @media ${tablet} {
      .combo-button-label {
        font-size: 14px;
      }
    }

    .combo-button {
      padding-left: 14px;

      .combo-button-label {
        margin-right: 0;
      }

      .combo-buttons_arrow-icon {
        margin-right: 4px;
      }

      @media ${tablet} {
        height: 40px;
      }
    }

    div[disabled] {
      display: none;
    }
  }

  @media ${mobile} {
    display: none;
  }
`;
StyledOnPage.defaultProps = { theme: Base };

const StyledPage = styled.div`
  width: 83px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: ${theme.paging.page.marginRight};`
      : `margin-right: ${theme.paging.page.marginRight};`}

  .manualWidth {
    padding: 0;

    @media ${tablet} {
      .combo-button-label {
        font-size: 14px;
      }
    }

    .combo-button {
      padding-left: 14px;

      .combo-button-label {
        margin-right: 0;
      }

      .combo-buttons_arrow-icon {
        margin-right: 4px;
      }

      @media ${tablet} {
        height: 40px;
      }
    }

    .dropdown-container {
      width: ${(props) => props.theme.paging.page.width};
    }
  }
`;
StyledPage.defaultProps = { theme: Base };

export { StyledPage, StyledOnPage, StyledPaging };
