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

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { DateTime } from "luxon";

import { inject, observer } from "mobx-react";
import { useParams } from "react-router";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import HistoryFilterHeader from "./sub-components/HistoryFilterHeader";
import WebhookHistoryTable from "./sub-components/WebhookHistoryTable";
import { WebhookHistoryLoader } from "../sub-components/Loaders";

import EmptyFilter from "./sub-components/EmptyFilter";

import styles from "./WebhookHistory.styled.module.scss";

const parseUrl = (url) => {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;

  const params = {};
  const entries = Array.from(searchParams.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    params[key] = value;
  }
  params.deliveryDate =
    params.deliveryDate === "null"
      ? null
      : DateTime.fromFormat(params.deliveryDate, "yyyy-MM-dd", { zone: window.timezone });
  params.deliveryFrom = DateTime.fromFormat(params.deliveryFrom, "HH:mm", { zone: window.timezone });
  params.deliveryTo = DateTime.fromFormat(params.deliveryTo, "HH:mm", { zone: window.timezone });
  params.status = JSON.parse(params.status);

  return params;
};

function hasNoSearchParams(url) {
  const urlObj = new URL(url);
  return urlObj.search === "";
}

const WebhookHistory = (props) => {
  const {
    historyItems,
    fetchHistoryItems,
    emptyCheckedIds,
    clearHistoryFilters,
    setHistoryFilters,
  } = props;

  const [isFetchFinished, setIsFetchFinished] = useState(false);
  const [, startTransition] = useTransition();

  const { id } = useParams();

  const fetchItems = async () => {
    if (hasNoSearchParams(window.location)) {
      await fetchHistoryItems({
        configId: id,
      });
    } else {
      const parsedParams = parseUrl(window.location);
      setHistoryFilters(parsedParams);
      await fetchHistoryItems({
        ...formatFilters(parsedParams),
        configId: id,
      });
    }
    setIsFetchFinished(true);
  };

  useEffect(() => {
    startTransition(fetchItems);
    return clearHistoryFilters;
  }, []);

  const applyFilters = async ({ deliveryFrom, deliveryTo, groupStatus }) => {
    emptyCheckedIds();
    const params = { configId: id, deliveryFrom, deliveryTo, groupStatus };

    await fetchHistoryItems(params);
  };

  return (
    <div className={styles.webhookWrapper}>
      <Suspense fallback={<WebhookHistoryLoader />}>
        <main>
          <HistoryFilterHeader applyFilters={applyFilters} />
          {historyItems.length === 0 && isFetchFinished ? (
            <EmptyFilter applyFilters={applyFilters} />
          ) : (
            <WebhookHistoryTable />
          )}
        </main>
      </Suspense>
    </div>
  );
};

export const Component = inject(({ webhooksStore }) => {
  const {
    historyItems,
    fetchHistoryItems,
    emptyCheckedIds,
    clearHistoryFilters,
    setHistoryFilters,
  } = webhooksStore;

  return {
    historyItems,
    fetchHistoryItems,
    emptyCheckedIds,
    clearHistoryFilters,
    setHistoryFilters,
  };
})(observer(WebhookHistory));
