import styled, { css } from "styled-components";
import { RowContainer } from "@docspace/shared/components/row-container";
import { isMobile } from "react-device-detect";
import { Row } from "@docspace/shared/components/row";
import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils/device";
import { RowContent } from "@docspace/shared/components/row-content";

export const GroupsRowContainer = styled(RowContainer)`
  .row-selected + .row-wrapper:not(.row-selected),
  .row-wrapper:not(.row-selected) + .row-selected,
  .row-selected:first-child {
    .group-row {
      border-top: ${({ theme }) =>
        `1px ${theme.filesSection.tableView.row.borderColor} solid`};
      margin: -3px -24px 0 -24px;
      padding: 0 24px;
      @media ${tablet} {
        margin: -3px -16px 0 -16px;
        padding: 0 16px;
      }
    }
  }
  .row-selected:last-child {
    .group-row {
      border-bottom: ${({ theme }) =>
        `1px ${theme.filesSection.tableView.row.borderColor} solid`};
      margin: 0 -24px;
      padding: 0 24px 1px 24px;
      @media ${tablet} {
        margin: 0 -16px;
        padding: 0 16px 1px 16px;
      }
      &::after {
        height: 0px;
      }
    }
  }
  .row-hotkey-border + .row-selected {
    .group-row {
      border-top: 1px solid #2da7db !important;
    }
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
  }
`;

const checkedStyle = css`
  background: ${({ theme }) => theme.filesSection.rowView.checkedBackground};
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

export const GroupsRow = styled(Row)`
  ${({ checked, isActive }) => (checked || isActive) && checkedStyle};
  &:hover {
    cursor: pointer;
    ${checkedStyle}
    margin-top: -3px;
    padding-bottom: 1px;
    border-top: 1px
      ${({ theme }) => theme.filesSection.tableView.row.borderColor} solid;
    border-bottom: 1px
      ${({ theme }) => theme.filesSection.tableView.row.borderColor} solid;
  }
  position: unset;
  margin-top: -2px;
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
