// (c) Copyright Ascensio System SIA 2009-2025
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

import styled from "styled-components";
import { useParams } from "react-router";
import { inject, observer } from "mobx-react";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { injectDefaultTheme } from "@docspace/shared/utils";
import { RowContainer } from "@docspace/shared/components/rows";

import { formatFilters } from "SRC_DIR/helpers/webhooks";
import HistoryRow from "./HistoryRow";

const StyledRowContainer = styled(RowContainer).attrs(injectDefaultTheme)`
  margin-top: 12px;

  .row-list-item {
    cursor: pointer;
    padding-inline-end: 16px;
  }
  .row-item::after {
    bottom: -3px;
  }

  .row-list-item:has(.selected-row-item) {
    background-color: ${(props) =>
      props.theme.client.settings.webhooks.historyRowBackground};
  }
`;

const HistoryRowView = (props) => {
  const {
    historyItems,
    sectionWidth,
    viewAs,
    setViewAs,
    hasMoreItems,
    totalItems,
    fetchMoreItems,
    historyFilters,
    currentDeviceType,
  } = props;
  const { id } = useParams();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const fetchMoreFiles = () => {
    const params = historyFilters === null ? {} : formatFilters(historyFilters);
    fetchMoreItems({ ...params, configId: id });
  };

  return (
    <StyledRowContainer
      filesLength={historyItems.length}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasMoreItems}
      itemCount={totalItems}
      draggable
      useReactWindow
      itemHeight={59}
    >
      {historyItems.map((item) => (
        <HistoryRow
          key={item.id}
          historyItem={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup, webhooksStore, settingsStore }) => {
  const { viewAs, setViewAs } = setup;
  const {
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
  } = webhooksStore;

  const { currentDeviceType } = settingsStore;
  return {
    viewAs,
    setViewAs,
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
    currentDeviceType,
  };
})(observer(HistoryRowView));
