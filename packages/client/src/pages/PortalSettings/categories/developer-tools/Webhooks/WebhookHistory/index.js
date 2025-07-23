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

import React, { useState, useEffect, useTransition, Suspense } from "react";
import moment from "moment-timezone";
import styled from "styled-components";

import { inject, observer } from "mobx-react";
import { useParams } from "react-router";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import HistoryFilterHeader from "./sub-components/HistoryFilterHeader";
import WebhookHistoryTable from "./sub-components/WebhookHistoryTable";
import { WebhookHistoryLoader } from "../sub-components/Loaders";

import EmptyFilter from "./sub-components/EmptyFilter";

const WebhookWrapper = styled.div`
  width: 100%;
`;

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
      : moment(params.deliveryDate, "YYYY-MM-DD").tz(window.timezone);
  params.deliveryFrom = moment(params.deliveryFrom, "HH:mm").tz(
    window.timezone,
  );
  params.deliveryTo = moment(params.deliveryTo, "HH:mm").tz(window.timezone);
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
    <WebhookWrapper>
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
    </WebhookWrapper>
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
