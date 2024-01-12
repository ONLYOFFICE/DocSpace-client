import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { tablet } from "@docspace/components/utils/device";

import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import RowContainer from "@docspace/components/row-container";
import SessionsRow from "./SessionsRow";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

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

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 24px;

  .table-group-menu {
    height: 60px;
    position: absolute;
    z-index: 201;
    top: -170px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -16px;
          `
        : css`
            left: -16px;
          `}
    width: 100%;

    .table-container_group-menu {
      padding: 0px 16px;
      border-image-slice: 0;
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
    }

    .table-container_group-menu-checkbox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

  .row-selected + .row-wrapper:not(.row-selected) {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-hotkey-border + .row-selected {
    .user-row {
      border-top: 1px solid #2da7db !important;
    }
  }

  .row-selected:last-child {
    .user-row {
      border-bottom: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      padding-bottom: 1px;

      ${marginStyles}
    }
    .user-row::after {
      height: 0px;
    }
  }
  .row-selected:first-child {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .header-container-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    color: #a3a9ae;
  }

  .table-container_header {
    position: absolute;
  }
`;

const RowView = (props) => {
  const {
    t,
    sectionWidth,
    sessionsData,
    // allSessions,
    // checkedSessions,
    // toggleSession,
    // toggleAllSessions,
    // isSessionChecked,
  } = props;

  // const handleAllToggles = (checked) => {
  //   toggleAllSessions(checked, allSessions);
  // };

  const headerMenu = [
    {
      id: "sessions",
      key: "Sessions",
      label: t("Common:Sessions"),
      onClick: () => console.log("Sessions"),
      iconUrl: HistoryFinalizedReactSvgUrl,
    },
    {
      id: "logout",
      key: "Logout",
      label: t("Common:Logout"),
      onClick: () => console.log("Logout"),
      iconUrl: RemoveSvgUrl,
    },
    {
      id: "Disable",
      key: "Disable",
      label: t("Common:DisableUserButton"),
      onClick: () => console.log("Disable"),
      iconUrl: TrashReactSvgUrl,
    },
  ];

  // const isChecked = checkedSessions.length === allSessions.length;

  // const isIndeterminate =
  //   checkedSessions.length > 0 && checkedSessions.length !== allSessions.length;

  return (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow={false}
      hasMoreFiles={false}
      itemHeight={58}
      itemCount={sessionsData.length}
      filesLength={sessionsData.length}
      fetchMoreFiles={() => {}}
    >
      {/* {checkedSessions.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            checkboxOptions={[]}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            onChange={handleAllToggles}
          />
        </div>
      )} */}

      {sessionsData.map((item) => (
        <SessionsRow
          t={t}
          key={item.id}
          item={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ auth, setup }) => {
  const { id: userId } = auth.userStore.user;
  const {
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  } = setup;

  return {
    userId,
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  };
})(observer(RowView));
