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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";

import api from "@docspace/shared/api";
import { isRequestAborted } from "@docspace/shared/utils/axios/isRequestAborted";
import { formatDate, parseToDateTime } from "@docspace/ui-kit/utils/date";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type {
  TFeedAction,
  TFeedData,
  RoomMember,
} from "@docspace/shared/api/rooms/types";

import { useLoader } from "../../helpers/useLoader";

const PAGE_COUNT = 100;

export type TSelectionHistoryDay = {
  day: string;
  feeds: TFeedAction<TFeedData | RoomMember>[];
};

const parseHistory = (
  feedActions: TFeedAction<TFeedData | RoomMember>[],
): TSelectionHistoryDay[] => {
  const parsedFeeds: TSelectionHistoryDay[] = [];

  feedActions.forEach((feed) => {
    const dt = parseToDateTime(feed.date);
    const feedDay = dt ? formatDate(dt, "yyyy-MM-dd") : "";

    const last = parsedFeeds.at(-1);
    if (last && last.day === feedDay) {
      last.feeds.push({ ...feed });
    } else {
      parsedFeeds.push({
        day: feedDay,
        feeds: [{ ...feed }],
      });
    }
  });

  return parsedFeeds;
};

export type UseHistoryProps = {
  selection: TFile | TFolder;
};

export const useHistory = ({ selection }: UseHistoryProps) => {
  const [filter, setFilter] = React.useState({ page: 0, startIndex: 0 });
  const [total, setTotal] = React.useState(0);
  const [history, setHistory] = React.useState<TSelectionHistoryDay[]>([]);

  const [isFirstLoading, setIsFirstLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const abortController = React.useRef<AbortController | null>(null);

  const fetchHistory = React.useCallback(async () => {
    if (!selection?.id) return;

    setIsFirstLoading(true);

    abortController.current?.abort();
    abortController.current = new AbortController();

    const selectionType: "file" | "folder" =
      "isFolder" in selection && selection.isFolder ? "folder" : "file";

    const requestToken =
      "requestToken" in selection ? (selection.requestToken as string | undefined) : undefined;

    try {
      const response = await api.rooms.getHistory(
        selectionType,
        selection.id,
        { page: 0, startIndex: 0, count: PAGE_COUNT },
        abortController.current.signal,
        requestToken,
      );

      abortController.current = null;

      setTotal(response.total);
      setFilter({ page: 0, startIndex: 0 });
      setHistory(parseHistory(response.items));
    } catch (error) {
      if (isRequestAborted(error)) return;
      console.error("fetchHistory failed", error);
      setHistory([]);
      setTotal(0);
    } finally {
      setIsFirstLoading(false);
    }
  }, [selection]);

  const fetchMoreHistory = React.useCallback(async () => {
    if (!selection?.id) return;

    setIsLoading(true);

    abortController.current?.abort();
    abortController.current = new AbortController();

    const selectionType: "file" | "folder" =
      "isFolder" in selection && selection.isFolder ? "folder" : "file";

    const requestToken =
      "requestToken" in selection ? (selection.requestToken as string | undefined) : undefined;

    const page = filter.page + 1;
    const startIndex = filter.startIndex + PAGE_COUNT;

    try {
      const data = await api.rooms.getHistory(
        selectionType,
        selection.id,
        { page, startIndex, count: PAGE_COUNT },
        abortController.current.signal,
        requestToken,
      );

      abortController.current = null;

      const parsedHistory = parseHistory(data.items);

      const lastOldDay = history?.[history.length - 1]?.day;
      const firstNewDay = parsedHistory?.[0]?.day;

      const mergedHistory = history ? [...history] : [];

      if (lastOldDay === firstNewDay && parsedHistory[0]) {
        const lastIndex = mergedHistory.length - 1;
        mergedHistory[lastIndex].feeds.push(...parsedHistory[0].feeds);
        mergedHistory.push(...parsedHistory.slice(1));
      } else {
        mergedHistory.push(...parsedHistory);
      }

      setHistory(mergedHistory);
      setFilter({ page, startIndex });
      setTotal(data.total);
    } catch (e) {
      if (isRequestAborted(e)) return;
      console.error("fetchMoreHistory failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [selection, filter.page, filter.startIndex, history]);

  const { showLoading } = useLoader({ isFirstLoading });

  return {
    history,
    total,
    showLoading,
    isLoading,
    isFirstLoading,
    fetchHistory,
    fetchMoreHistory,
    abortController,
  };
};
