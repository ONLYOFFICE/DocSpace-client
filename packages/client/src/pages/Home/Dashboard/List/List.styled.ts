import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import NoUserSelect from "@docspace/components/utils/commonStyles";
import RowContainer from "@docspace/components/row-container";
import Row from "@docspace/components/row";
import RowContent from "@docspace/components/row-content";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  ${isMobile &&
  css`
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;
  `}

  @media (max-width: 1024px) {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }

  @media (max-width: 375px) {
    margin-left: -16px;
    margin-right: -8px;
    padding-left: 16px;
    padding-right: 8px;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

export const RoleRowContainer = styled(RowContainer)`
  .row-selected + .row-wrapper:not(.row-selected) {
    .role-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .role-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-hotkey-border + .row-selected {
    .role-row {
      border-top: 1px solid #2da7db !important;
    }
  }

  .row-selected:last-child {
    .role-row {
      border-bottom: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      padding-bottom: 1px;

      ${marginStyles}
    }
    .role-row::after {
      height: 0px;
    }
  }
  .row-selected:first-child {
    .role-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }
`;

export const RoleRowWrapper = styled.div`
  border: 1px solid transparent;
  border-left: none;
  border-right: none;
  margin-left: 0;
  height: 100%;
  user-select: none;

  position: relative;
  outline: none;
  background: none !important;
`;

export const RoleRow = styled(Row)`
  ${(props) => (props.checked || props.isActive) && checkedStyle};

  ${!isMobile &&
  css`
    :hover {
      cursor: pointer;
      ${checkedStyle}

      margin-top: -3px;
      padding-bottom: 1px;
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      border-bottom: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
    }
  `}

  position: unset;
  margin-top: -2px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .styled-element {
    height: 32px;
    margin-right: 12px;
  }
`;

export const RoleRowContent = styled(RowContent)`
  margin-left: 3px;

  .row-main-container-wrapper {
    display: flex;
    align-items: center;

    margin-top: 9px;
  }

  .mainIcons {
    height: 15px;
  }

  .rowMainContainer {
    margin-right: 6px;
  }
`;
