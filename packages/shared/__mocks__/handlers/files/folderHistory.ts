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
 * All non-code elements of the Project's GUI elements, including illustrations,
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

import { http, HttpResponse } from "msw";
import { FeedActionKeys } from "../../../api/rooms/types";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const makeInitiator = () => ({
  id: ADMIN_ID,
  displayName: "Administrator",
  avatar: "",
  avatarSmall: "",
  avatarMedium: "",
  avatarMax: "",
  avatarOriginal: "",
  hasAvatar: false,
  isAnonim: false,
  profileUrl: "",
});

export type FolderHistoryFeedSeed = {
  id: number;
  /** ISO date in UTC, e.g. 2026-03-16T09:00:00.000Z */
  date: string;
  title: string;
};

export type FolderHistoryRequestLog = {
  fromDate: string | null;
  toDate: string | null;
  startIndex: string | null;
};

export type FolderHistoryHandlerHandle = {
  getRequests: () => FolderHistoryRequestLog[];
  getLastRequest: () => FolderHistoryRequestLog | undefined;
  reset: () => void;
};

export type FolderHistoryHandlerOptions = {
  feeds?: FolderHistoryFeedSeed[];
  handle?: { current: FolderHistoryHandlerHandle | null };
};

const makeFeed = (seed: FolderHistoryFeedSeed, folderId: number | string) => ({
  id: seed.id,
  action: { id: 5000, key: FeedActionKeys.FileCreated },
  data: {
    id: seed.id,
    title: seed.title,
    parentId: Number(folderId),
    parentTitle: "Mock room",
    parentType: 0,
    toFolderId: Number(folderId),
    fromParentType: 0,
    fromParentTitle: "",
  },
  date: seed.date,
  initiator: makeInitiator(),
  related: [],
});

export type FolderHistoryReportHandle = {
  getStatusRequestCount: () => number;
  getStartRequestCount: () => number;
};

export type FolderHistoryReportHandlerOptions = {
  /** How many status requests return an unfinished task before it completes */
  pollsBeforeComplete?: number;
  error?: string;
  resultFileUrl?: string;
  handle?: { current: FolderHistoryReportHandle | null };
};

const makeTask = (task: {
  error?: string;
  isCompleted: boolean;
  percentage: number;
  resultFileUrl?: string;
}) => ({
  id: "DocumentBuilderTask_1_mock",
  error: task.error ?? "",
  percentage: task.percentage,
  isCompleted: task.isCompleted,
  status: task.error ? 4 : task.isCompleted ? 2 : 1,
  resultFileId: task.resultFileUrl ? 42 : 0,
  resultFileName: task.resultFileUrl ? "History report.xlsx" : "",
  resultFileUrl: task.resultFileUrl ?? "",
});

const okResponse = (response: unknown) =>
  HttpResponse.json({ response, count: 1, status: 0, statusCode: 200 });

export const folderHistoryReportHandlers = (
  port: string,
  folderId: number | string,
  options: FolderHistoryReportHandlerOptions = {},
) => {
  const { pollsBeforeComplete = 1, error, resultFileUrl } = options;

  let startRequests = 0;
  let statusRequests = 0;

  if (options.handle) {
    options.handle.current = {
      getStatusRequestCount: () => statusRequests,
      getStartRequestCount: () => startRequests,
    };
  }

  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/folder/${folderId}/log/report`;

  return [
    http.post(url, () => {
      startRequests += 1;

      return okResponse(makeTask({ isCompleted: false, percentage: 0 }));
    }),
    http.get(url, () => {
      statusRequests += 1;

      if (statusRequests <= pollsBeforeComplete) {
        return okResponse(makeTask({ isCompleted: false, percentage: 60 }));
      }

      return okResponse(
        makeTask({ isCompleted: true, percentage: 100, error, resultFileUrl }),
      );
    }),
  ];
};

export const folderHistoryHandler = (
  port: string,
  folderId: number | string,
  options: FolderHistoryHandlerOptions = {},
) => {
  const feeds = options.feeds ?? [];
  const requests: FolderHistoryRequestLog[] = [];

  if (options.handle) {
    options.handle.current = {
      getRequests: () => [...requests],
      getLastRequest: () => requests.at(-1),
      reset: () => {
        requests.length = 0;
      },
    };
  }

  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/folder/${folderId}/log`,
    ({ request }) => {
      const params = new URL(request.url).searchParams;

      const fromDate = params.get("fromDate");
      const toDate = params.get("toDate");
      const startIndex = params.get("startIndex");

      requests.push({ fromDate, toDate, startIndex });

      const items = feeds
        .filter((feed) => {
          if (fromDate && feed.date < fromDate) return false;
          if (toDate && feed.date > toDate) return false;

          return true;
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((feed) => makeFeed(feed, folderId));

      return HttpResponse.json({
        response: items.slice(Number(startIndex ?? 0)),
        total: items.length,
        count: items.length,
        status: 0,
        statusCode: 200,
      });
    },
  );
};
