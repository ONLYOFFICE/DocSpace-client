/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect } from "react";
import { formatDate } from "@docspace/ui-kit/utils/date";
import { inject, observer } from "mobx-react";

import { SelectedItem } from "@docspace/ui-kit/components/selected-item";
import { Link } from "@docspace/ui-kit/components/link";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { formatFilters } from "SRC_DIR/helpers/webhooks";

import styles from "../WebhookHistory.styled.module.scss";

const SelectedDateTime = ({ historyFilters, clearDate }) => {
  return (
    <SelectedItem
      label={`${formatDate(historyFilters.deliveryDate.setZone(window.timezone), "dd MMM yyyy")} ${formatDate(historyFilters.deliveryFrom.setZone(window.timezone), "HH:mm")} - ${formatDate(historyFilters.deliveryTo.setZone(window.timezone), "HH:mm")}`}
      onClose={clearDate}
      onClick={clearDate}
    />
  );
};

const SelectedDate = ({ historyFilters, clearDate }) => (
  <SelectedItem
    label={formatDate(historyFilters.deliveryDate, "dd MMM yyyy")}
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
      formatDate(firstDate, "yyyy-MM-d HH:mm") ===
      formatDate(secondDate, "yyyy-MM-d HH:mm")
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
    <div className={styles.statusBarWrapper}>
      {historyFilters.deliveryDate !== null ? (
        !isEqualDates(
          historyFilters.deliveryFrom,
          historyFilters.deliveryFrom.startOf("day"),
        ) ||
        !isEqualDates(
          historyFilters.deliveryTo,
          historyFilters.deliveryTo.endOf("day"),
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
    </div>
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
