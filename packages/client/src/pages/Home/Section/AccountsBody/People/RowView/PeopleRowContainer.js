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

import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { RowContainer } from "@docspace/shared/components/row-container";
import { tablet } from "@docspace/shared/utils/device";

import EmptyScreen from "../../EmptyScreen";
import SimpleUserRow from "./SimpleUserRow";

const marginStyles = css`
  margin-inline: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline: -16px;
    padding-inline: 16px;
  }
`;

const StyledRowContainer = styled(RowContainer)`
  .row-selected + .row-wrapper:not(.row-selected) {
    .user-row {
      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .user-row {
      ${marginStyles}
    }
  }

  .row-list-item:first-child {
    .user-row {
      border-top: 2px solid transparent;
    }

    .row-selected {
      .user-row {
        border-top-color: ${(props) =>
          `${props.theme.filesSection.tableView.row.borderColor} !important`};
      }
    }
  }

  .row-list-item {
    margin-top: -1px;
  }
`;

const PeopleRowContainer = ({
  peopleList,
  sectionWidth,
  accountsViewAs,
  setViewAs,
  theme,
  infoPanelVisible,
  isFiltered,
  fetchMoreAccounts,
  hasMoreAccounts,
  filterTotal,
  currentDeviceType,
}) => {
  useViewEffect({
    view: accountsViewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return peopleList.length !== 0 || !isFiltered ? (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow
      fetchMoreFiles={fetchMoreAccounts}
      hasMoreFiles={hasMoreAccounts}
      itemCount={filterTotal}
      filesLength={peopleList.length}
      itemHeight={58}
    >
      {peopleList.map((item, index) => (
        <SimpleUserRow
          theme={theme}
          key={item.id}
          item={item}
          itemIndex={index}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  ) : (
    <EmptyScreen />
  );
};

export default inject(
  ({ peopleStore, filesStore, settingsStore, infoPanelStore }) => {
    const {
      usersStore,
      filterStore,
      viewAs: accountsViewAs,
      setViewAs,
    } = peopleStore;
    const { theme, currentDeviceType } = settingsStore;
    const { peopleList, hasMoreAccounts, fetchMoreAccounts } = usersStore;
    const { filterTotal, isFiltered } = filterStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    return {
      peopleList,
      accountsViewAs,
      setViewAs,
      theme,
      infoPanelVisible,

      fetchMoreAccounts,
      hasMoreAccounts,
      filterTotal,
      isFiltered,
      currentDeviceType,
    };
  },
)(observer(PeopleRowContainer));
