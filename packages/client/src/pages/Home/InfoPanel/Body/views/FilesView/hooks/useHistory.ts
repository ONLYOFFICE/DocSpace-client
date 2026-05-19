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

import React from "react";
import axios from "axios";

import api from "@docspace/shared/api";
import { formatDate, parseToDateTime } from "@docspace/ui-kit/utils/date";
import { RoomsType } from "@docspace/shared/enums";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import {
  RoomMember,
  TFeed,
  TFeedAction,
  TFeedData,
  TRoom,
} from "@docspace/shared/api/rooms/types";

import type PublicRoomStore from "SRC_DIR/store/PublicRoomStore";

import { getFeedInfo } from "../../History/FeedInfo";
import { TSelectionHistory } from "../../History/History.types";
import { useLoader } from "../../../helpers/useLoader";

const PAGE_COUNT = 100;

const addLinksToHistory = (fetchedHistory: TFeed, links: RoomMember[]) => {
  const historyWithLinks: TFeedAction<TFeedData | RoomMember>[] =
    fetchedHistory.items.map((feed) => {
      const feedInfo = getFeedInfo(feed);

      if (!feedInfo) return feed;

      const { actionType, targetType } = feedInfo;

      if (
        targetType !== "roomExternalLink" ||
        actionType === "rename" ||
        actionType === "delete"
      )
        return feed;

      const link = links.find((l) => l.sharedTo.id === feed.data.id);

      if (!link) return feed;

      return { ...feed, data: link };
    });

  return { ...fetchedHistory, items: historyWithLinks };
};

const parseHistory = (feedActions: TFeedAction<TFeedData | RoomMember>[]) => {
  const parsedFeeds: TSelectionHistory[] = [];

  feedActions.forEach((feed) => {
    const dt = parseToDateTime(feed.date);
    const feedDay = dt ? formatDate(dt, "yyyy-MM-dd") : "";

    if (parsedFeeds.length && parsedFeeds.at(-1)?.day === feedDay) {
      parsedFeeds.at(-1)?.feeds.push({ ...feed });
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
  selection: TRoom | TFile | TFolder;

  setExternalLinks: PublicRoomStore["setExternalLinks"];
};

export const useHistory = ({
  selection,

  setExternalLinks,
}: UseHistoryProps) => {
  const [filter, setFilter] = React.useState({
    page: 0,
    startIndex: 0,
  });

  const [total, setTotal] = React.useState(0);

  const [history, setHistory] = React.useState<TSelectionHistory[]>([]);

  const [isFirstLoading, setIsFirstLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const abortController = React.useRef<AbortController>(null);

  const fetchHistory = React.useCallback(async () => {
    if (!selection?.id) return;

    setIsFirstLoading(true);

    abortController.current?.abort();
    abortController.current = new AbortController();

    const isFolder = "isFolder" in selection && selection.isFolder;
    const isRoom = "isRoom" in selection && (selection.isRoom as boolean);
    const roomType = "roomType" in selection && selection.roomType;

    const selectionType: "file" | "folder" =
      isRoom || isFolder ? "folder" : "file";

    const selectionRequestToken =
      ("requestToken" in selection && selection.requestToken) || undefined;

    const withLinks =
      isRoom &&
      roomType &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        roomType,
      );

    try {
      const response = await api.rooms.getHistory(
        selectionType,
        selection.id,
        { page: 0, startIndex: 0, count: PAGE_COUNT },
        abortController.current.signal,
        selectionRequestToken,
      );

      abortController.current = null;

      setTotal(response.total);
      setFilter({
        page: 0,
        startIndex: 0,
      });

      if (withLinks) {
        const links = await api.rooms
          .getRoomMembers(String(selection.id), {
            filterType: 2, // External link
          })
          .then((res) => res.items);

        const historyWithLinks = addLinksToHistory(response, links);

        setExternalLinks(links);

        setHistory(parseHistory(historyWithLinks.items));

        return;
      }

      setExternalLinks([]);
      setHistory(parseHistory(response.items));
    } catch (error) {
      if (axios.isCancel(error)) return;
      throw error;
    } finally {
      setIsFirstLoading(false);
    }
  }, [
    selection.id,
    "isFolder" in selection && selection.isFolder,
    "isRoom" in selection && selection.isRoom,
    "roomType" in selection && selection.roomType,
    "requestToken" in selection && selection.requestToken,
    setExternalLinks,
  ]);

  const fetchMoreHistory = async () => {
    if (!selection?.id) return;

    setIsLoading(true);

    abortController.current?.abort();
    abortController.current = new AbortController();

    const isFolder = "isFolder" in selection && selection.isFolder;
    const isRoom = "isRoom" in selection && (selection.isRoom as boolean);
    const roomType = "roomType" in selection ? selection.roomType : null;
    const requestToken =
      "requestToken" in selection ? selection.requestToken : undefined;

    const selectionType: "file" | "folder" =
      isRoom || isFolder ? "folder" : "file";

    const withLinks =
      isRoom &&
      roomType &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        roomType,
      );

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

      let feedWithLinks: ReturnType<typeof addLinksToHistory> = data;

      if (withLinks) {
        const links = await api.rooms
          .getRoomMembers(String(selection.id), {
            filterType: 2,
          })
          .then((res) => res.items);

        feedWithLinks = addLinksToHistory(data, links);

        setExternalLinks(links);
      } else {
        setExternalLinks([]);
      }

      const parsedHistory = parseHistory(feedWithLinks.items);

      const lastOldDay = history?.[history.length - 1]?.day;
      const firstNewDay = parsedHistory?.[0]?.day;

      const mergedHistory = history ? [...history] : [];

      if (lastOldDay === firstNewDay) {
        const lastIndex = mergedHistory.length - 1;
        mergedHistory[lastIndex].feeds.push(...parsedHistory[0].feeds);
        mergedHistory.push(...parsedHistory.slice(1));
      } else {
        mergedHistory.push(...parsedHistory);
      }

      setHistory(mergedHistory);
      setTotal(data.total);
    } catch (e) {
      if (axios.isCancel(e)) return;
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const { showLoading } = useLoader({
    isFirstLoading,
  });

  return {
    history,
    total,
    hasNextPage: total > history.length,
    showLoading,
    isLoading,
    isFirstLoading,
    fetchHistory,
    fetchMoreHistory,

    abortController,
  };
};
