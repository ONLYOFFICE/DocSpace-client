import styled, { css } from "styled-components";
import { RowContainer } from "@docspace/shared/components/row-container";
import { isMobile } from "react-device-detect";
import { Row } from "@docspace/shared/components/row";
import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils/device";
import { RowContent } from "@docspace/shared/components/row-content";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  @media ${tablet} {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const marginStylesGroupRowContainer = css`
  margin-right: -48px !important;

  @media ${tablet} {
    margin-right: -32px !important;
  }
`;

export const GroupsRowContainer = styled(RowContainer)`
  .row-selected + .row-wrapper:not(.row-selected) {
    .group-row {
      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .group-row {
      ${marginStyles}
    }
  }

  .row-list-item:first-child {
    .group-row {
      border-top: 2px solid transparent;
    }

    .row-selected {
      .group-row {
        border-top-color: ${(props) =>
          `${props.theme.filesSection.tableView.row.borderColor} !important`};
      }
    }
  }

  .row-list-item {
    margin-top: -1px;
  }
`;

export const GroupsRowWrapper = styled.div`
  .group-item {
    border: 1px solid transparent;
    border-left: none;
    border-right: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0;
          `
        : css`
            margin-left: 0;
          `}
    height: 100%;
    group-select: none;
    position: relative;
    outline: none;
    background: none !important;

    ${(props) =>
      (props.isChecked || props.isActive) && marginStylesGroupRowContainer};

    :hover {
      ${marginStylesGroupRowContainer}
    }
  }
`;

const checkedStyle = css`
  background: ${({ theme }) => theme.filesSection.rowView.checkedBackground};
  margin-left: -24px;
  padding-left: 24px;
  padding-right: 24px;
  @media ${tablet} {
    margin-left: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

export const GroupsRow = styled(Row)`
  ${({ checked, isActive }) => (checked || isActive) && checkedStyle};
  &:hover {
    cursor: pointer;
    ${checkedStyle}
  }

  .row_content {
    height: 58px;
  }

  height: 59px;

  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
  border-bottom: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

  box-sizing: border-box;
  margin-top: -1px;

  position: unset;

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  .styled-element {
    height: 32px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }
  .group-row-element {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    line-height: 16px;
    background: #eceef1;
    color: #333;
    border-radius: 50%;
  }
`;

export const GroupsRowContent = styled(RowContent)`
  display: flex;
  align-items: center;
  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      max-width: inherit;
      margin: 0;
    }
  }
  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
    }
  }
`;

GroupsRow.defaultProps = { theme: Base };
