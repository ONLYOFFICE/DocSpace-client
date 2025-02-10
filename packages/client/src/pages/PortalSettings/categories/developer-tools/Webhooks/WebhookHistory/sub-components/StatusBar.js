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

import React, { useEffect } from "react";
import moment from "moment-timezone";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { SelectedItem } from "@docspace/shared/components/selected-item";
import { Link } from "@docspace/shared/components/link";
import { globalColors } from "@docspace/shared/themes";
import { formatFilters } from "SRC_DIR/helpers/webhooks";

const StatusBarWrapper = styled.div`
  margin-top: 9px;

  .statusBarItem:last-of-type {
    margin-inline-end: 0;
  }

  .statusActionItem {
    margin-inline-start: 12px;
  }
`;

const SelectedDateTime = ({ historyFilters, clearDate }) => {
  return (
    <SelectedItem
      label={`${moment(historyFilters.deliveryDate)
        .tz(window.timezone)
        .format("DD MMM YYYY")} ${moment(historyFilters.deliveryFrom)
        .tz(window.timezone)
        .format("HH:mm")} - ${moment(historyFilters.deliveryTo)
        .tz(window.timezone)
        .format("HH:mm")}`}
      onClose={clearDate}
      onClick={clearDate}
    />
  );
};

const SelectedDate = ({ historyFilters, clearDate }) => (
  <SelectedItem
    label={moment(historyFilters.deliveryDate).format("DD MMM YYYY")}
    onClose={clearDate}
    onClick={clearDate}
  />
);

const StatusBar = (props) => {
  const {
    historyFilters,
    applyFilters,
    clearHistoryFilters,
    clearDate,
    unselectStatus,
  } = props;

  const clearAll = () => {
    applyFilters(
      formatFilters({
        deliveryDate: null,
        status: [],
      }),
    );
    clearHistoryFilters();
  };

  const SelectedStatuses = historyFilters.status.map((statusCode) => (
    <SelectedItem
      label={statusCode}
      key={statusCode}
      onClose={() => unselectStatus(statusCode)}
      onClick={() => unselectStatus(statusCode)}
    />
  ));

  const isEqualDates = (firstDate, secondDate) => {
    return (
      firstDate.format("YYYY-MM-D HH:mm") ===
      secondDate.format("YYYY-MM-D HH:mm")
    );
  };

  useEffect(() => {
    applyFilters(formatFilters(historyFilters));
    if (
      historyFilters.deliveryDate === null &&
      historyFilters.status.length === 0
    ) {
      clearHistoryFilters();
    }
  }, [historyFilters]);

  return historyFilters.deliveryDate === null &&
    historyFilters.status.length === 0 ? (
    ""
  ) : (
    <StatusBarWrapper>
      {historyFilters.deliveryDate !== null ? (
        !isEqualDates(
          historyFilters.deliveryFrom,
          historyFilters.deliveryFrom.clone().startOf("day"),
        ) ||
        !isEqualDates(
          historyFilters.deliveryTo,
          historyFilters.deliveryTo.clone().endOf("day"),
        ) ? (
          <SelectedDateTime
            historyFilters={historyFilters}
            clearDate={clearDate}
          />
        ) : (
          <SelectedDate historyFilters={historyFilters} clearDate={clearDate} />
        )
      ) : (
        ""
      )}
      {SelectedStatuses}
      {(historyFilters.deliveryDate !== null &&
        historyFilters.status.length > 0) ||
      historyFilters.status.length > 1 ? (
        <Link
          type="action"
          fontWeight={600}
          isHovered
          onClick={clearAll}
          color={globalColors.gray}
          className="statusActionItem"
        >
          Clear all
        </Link>
      ) : null}
    </StatusBarWrapper>
  );
};

export default inject(({ webhooksStore }) => {
  const { historyFilters, clearHistoryFilters, clearDate, unselectStatus } =
    webhooksStore;

  return {
    historyFilters,
    clearHistoryFilters,
    clearDate,
    unselectStatus,
  };
})(observer(StatusBar));
