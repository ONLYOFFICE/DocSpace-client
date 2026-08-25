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

import { makeAutoObservable } from "mobx";
import axios from "axios";

import Filter from "@docspace/shared/api/people/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getPortal, getPortalUsersCount } from "@docspace/shared/api/portal";
import { getFilesUsedSpace } from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  checkRecalculateQuota,
  getQuotaSettings,
  recalculateQuota,
} from "@docspace/shared/api/settings";
import { getRooms } from "@docspace/shared/api/rooms";
import { getUserList } from "@docspace/shared/api/people";
import { SortByFieldName, RoomsProviderType } from "@docspace/shared/enums";
import { getAIAgents } from "@docspace/shared/api/ai";

import type { TPortal } from "@docspace/shared/api/portal/types";
import type { TFilesUsedSpace } from "@docspace/shared/api/files/types";
import type { TGetUserList } from "@docspace/shared/api/people/types";
import type { TGetRooms } from "@docspace/shared/api/rooms/types";
import type { TGetAgents } from "@docspace/shared/api/ai/types";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type PeopleStore from "./contacts/PeopleStore";
import type UsersStore from "./contacts/UsersStore";
import type FilesStore from "./FilesStore";

const FILTER_COUNT = 6;

type TQuotaSettings = { lastRecalculateDate?: string };

type TPeopleListItem = ReturnType<UsersStore["getPeopleListItem"]>;

type TFilesStore = FilesStore;

class StorageManagement {
  isInit = false;

  portalInfo: Partial<TPortal> = {};

  activeUsersCount: number | null = null;

  filesUsedSpace: Partial<TFilesUsedSpace> = {};

  quotaSettings: TQuotaSettings = {};

  intervalId: ReturnType<typeof setInterval> | null = null;

  rooms: unknown[] = [];

  accounts: TPeopleListItem[] = [];

  aIAgents: unknown[] = [];

  needRecalculating = false;

  isRecalculating = false;

  userFilterData = Filter.getDefault();

  roomFilterData = RoomsFilter.getDefault();

  filesStore: TFilesStore;

  peopleStore: PeopleStore;

  authStore: AuthStore;

  currentQuotaStore: CurrentQuotasStore;

  settingsStore: SettingsStore;

  constructor(
    filesStore: TFilesStore,
    peopleStore: PeopleStore,
    authStore: AuthStore,
    currentQuotaStore: CurrentQuotasStore,
    settingsStore: SettingsStore,
  ) {
    this.filesStore = filesStore;
    this.peopleStore = peopleStore;
    this.authStore = authStore;
    this.currentQuotaStore = currentQuotaStore;
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  basicRequests = async (isInit?: boolean) => {
    const { getFilesListItems } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getPeopleListItem } = usersStore;
    const { isFreeTariff } = this.currentQuotaStore;
    const { standalone } = this.settingsStore;

    this.userFilterData.pageCount = FILTER_COUNT;
    this.userFilterData.sortBy = SortByFieldName.UsedSpace;
    this.userFilterData.sortOrder = "descending";

    this.roomFilterData.pageCount = FILTER_COUNT;
    this.roomFilterData.sortBy = SortByFieldName.UsedSpace;
    this.roomFilterData.sortOrder = "descending";
    // RoomsFilter.provider is typed Nullable<string> but has
    // always been assigned the numeric RoomsProviderType.Storage here.
    this.roomFilterData.provider = RoomsProviderType.Storage as unknown as string;

    const portalAbortRequests = new AbortController();
    const portalUsersCountAbortRequests = new AbortController();
    const filesUsedSpaceAbortRequests = new AbortController();
    const quotaSettingsAbortRequests = new AbortController();

    const userAbortRequests = new AbortController();
    const roomAbortRequests = new AbortController();

    const checkRecalculateQuotaAbortRequests = new AbortController();
    const recalculateQuotaAbortRequests = new AbortController();

    this.settingsStore.addAbortControllers([
      portalAbortRequests,
      portalUsersCountAbortRequests,
      filesUsedSpaceAbortRequests,
      quotaSettingsAbortRequests,

      userAbortRequests,
      roomAbortRequests,

      checkRecalculateQuotaAbortRequests,
      recalculateQuotaAbortRequests,
    ]);

    this.needRecalculating = false;

    try {
      if (isInit)
        this.needRecalculating = (await checkRecalculateQuota(
          checkRecalculateQuotaAbortRequests.signal,
        )) as boolean;

      if (!this.needRecalculating && this.isRecalculating)
        this.setIsRecalculating(false);

      let roomsList: TGetRooms | undefined;
      let accountsList: TGetUserList | undefined;
      let aIAgentsList: TGetAgents | undefined;

      const requests: Promise<unknown>[] = [
        getPortal(portalAbortRequests.signal),
        getPortalUsersCount(portalUsersCountAbortRequests.signal) as Promise<unknown>,
        getFilesUsedSpace(filesUsedSpaceAbortRequests.signal),
        getQuotaSettings(quotaSettingsAbortRequests.signal) as Promise<unknown>,
      ];
      if (!isFreeTariff || standalone) {
        requests.push(
          getUserList(this.userFilterData, userAbortRequests.signal),
          getRooms(this.roomFilterData, roomAbortRequests.signal),
          getAIAgents(this.roomFilterData, roomAbortRequests.signal),
        );
      }

      [
        this.portalInfo,
        this.activeUsersCount,
        this.filesUsedSpace,
        this.quotaSettings,
        accountsList,
        roomsList,
        aIAgentsList,
      ] = (await Promise.all(requests)) as [
        TPortal,
        number,
        TFilesUsedSpace,
        TQuotaSettings,
        TGetUserList | undefined,
        TGetRooms | undefined,
        TGetAgents | undefined,
      ];

      if (roomsList) this.rooms = getFilesListItems(roomsList?.folders);

      if (aIAgentsList)
        this.aIAgents = getFilesListItems(aIAgentsList?.folders);

      if (accountsList)
        this.accounts = accountsList.items.map((user) =>
          getPeopleListItem(user),
        );

      if (!this.quotaSettings.lastRecalculateDate && isInit) {
        this.setIsRecalculating(true);

        try {
          // recalculateQuota accepts no arguments; the signal passed
          // historically was silently ignored.
          await recalculateQuota();

          this.getIntervalCheckRecalculate();
        } catch (e) {
          if (axios.isCancel(e)) return;
          toastr.error(e as string);

          this.setIsRecalculating(false);
        }

        return;
      }

      if (this.needRecalculating) {
        this.setIsRecalculating(true);
        this.getIntervalCheckRecalculate();
      }
    } catch (e) {
      if (axios.isCancel(e)) return;
      toastr.error(e as string);
    }
  };

  init = async () => {
    try {
      await this.basicRequests(true);

      this.isInit = true;
    } catch (e) {
      toastr.error(e as string);
    }
  };

  updateQuotaInfo = async (type: "user" | "agent" | "room") => {
    const { fetchPortalQuota } = this.currentQuotaStore;
    const { getFilesListItems } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getPeopleListItem } = usersStore;

    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    // refresh=true: the endpoint is cached and would echo the pre-save
    // quota (defaultQuota -2) right after a mutation.
    const requests: Promise<unknown>[] = [fetchPortalQuota(true)];

    type === "user"
      ? requests.push(getUserList(userFilterData))
      : type === "agent"
        ? requests.push(getAIAgents(roomFilterData))
        : requests.push(getRooms(roomFilterData));

    try {
      const [, items] = await Promise.all(requests);

      if (type === "user") {
        this.accounts = (items as TGetUserList).items.map((user) =>
          getPeopleListItem(user),
        );
        return;
      }
      if (type === "agent") {
        console.log("agent", (items as TGetAgents).folders);
        this.aIAgents = getFilesListItems((items as TGetAgents).folders);
        return;
      }

      this.rooms = getFilesListItems((items as TGetRooms).folders);
    } catch (e) {
      toastr.error(e as string);
    }
  };

  setIsRecalculating = (isRecalculating: boolean) => {
    this.isRecalculating = isRecalculating;
  };

  getIntervalCheckRecalculate = () => {
    let isWaitRequest = false;

    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        if (isWaitRequest) {
          return;
        }

        isWaitRequest = true;

        const result = (await checkRecalculateQuota()) as boolean;
        !this.isRecalculating && this.setIsRecalculating(true);

        if (result === false) {
          this.clearIntervalCheckRecalculate();

          this.setIsRecalculating(false);

          try {
            await this.basicRequests();
          } catch (e) {
            toastr.error(e as string);
          }
          return;
        }

        isWaitRequest = false;
      } catch (e) {
        toastr.error(e as string);

        this.clearIntervalCheckRecalculate();

        this.setIsRecalculating(false);
      }
    }, 2000);
  };

  clearIntervalCheckRecalculate = () => {
    this.intervalId && clearInterval(this.intervalId);

    this.intervalId = null;
  };
}

export default StorageManagement;
