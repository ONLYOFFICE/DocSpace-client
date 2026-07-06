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

import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

import { toastr } from "@docspace/ui-kit/components/toast";

import {
  createWebhook,
  getAllWebhooks,
  getWebhookTriggers,
  getWebhooksJournal,
  removeWebhook,
  toggleEnabledWebhook,
  updateWebhook,
} from "@docspace/shared/api/settings";

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TTranslation } from "@docspace/shared/types";
import type { DateTime } from "luxon";

export type TWebhook = {
  id: number;
  name: string;
  uri: string;
  secretKey?: string;
  enabled: boolean;
  ssl?: boolean;
  status?: number;
  triggers?: number;
  createdBy?: string;
  targetId?: string;
};

type TWebhookConfigData = {
  configs: TWebhook;
  status: number;
};

export type TWebhookHistoryItem = {
  id: number;
  configName?: string;
} & Record<string, unknown>;

export type TWebhookHistoryFilters = {
  deliveryDate: DateTime | null;
  deliveryFrom?: DateTime;
  deliveryTo?: DateTime;
  status: number[];
};

type TJournalParams = {
  configId?: number;
  eventId?: number;
  count?: number;
  startIndex?: number;
} & Record<string, unknown>;

type TJournalData = { items: TWebhookHistoryItem[]; total: number };

class WebhooksStore {
  settingsStore: SettingsStore;

  webhooks: TWebhook[] = [];

  webhookTriggers: unknown[] = [];

  checkedEventIds: number[] = [];

  historyFilters: TWebhookHistoryFilters | null = null;

  historyItems: TWebhookHistoryItem[] = [];

  startIndex = 0;

  totalItems = 0;

  currentWebhook: Partial<TWebhook> = {};

  eventDetails: Partial<TWebhookHistoryItem> | undefined = {};

  FETCH_COUNT = 100;

  isRetryPending = false;

  configName = "";

  errorWebhooks: { error: string } | null = null;

  constructor(settingsStore: SettingsStore) {
    makeAutoObservable(this);

    this.settingsStore = settingsStore;
  }

  setRetryPendingFalse = () => {
    this.isRetryPending = false;
  };

  setRetryPendingTrue = () => {
    this.isRetryPending = true;
  };

  setCurrentWebhook = (webhook: TWebhook) => {
    this.currentWebhook = webhook;
  };

  loadWebhookTriggers = async () => {
    const triggers = (await getWebhookTriggers()) as unknown[];
    runInAction(() => {
      this.webhookTriggers = triggers;
    });
  };

  loadWebhooks = async () => {
    const { passwordSettings, getPortalPasswordSettings } = this.settingsStore;

    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const webhooksData = (await getAllWebhooks(
        abortController.signal,
      )) as TWebhookConfigData[];
      if (!passwordSettings) {
        await getPortalPasswordSettings();
      }
      runInAction(() => {
        this.webhooks = webhooksData.map((data) => ({
          id: data.configs.id,
          name: data.configs.name,
          uri: data.configs.uri,
          secretKey: data.configs.secretKey,
          enabled: data.configs.enabled,
          ssl: data.configs.ssl,
          status: data.status,
          triggers: data.configs.triggers,
          createdBy: data.configs.createdBy,
          targetId: data.configs.targetId,
        }));
      });
    } catch (error) {
      if (axios.isCancel(error)) return;

      console.error(error);
      runInAction(() => {
        this.errorWebhooks = { error: "error" };
      });
    }
  };

  addWebhook = async (webhook: TWebhook) => {
    const webhookData = (await createWebhook(
      webhook.name,
      webhook.uri,
      webhook.secretKey,
      webhook.ssl,
      webhook.triggers,
      webhook.targetId,
    )) as TWebhook;

    this.webhooks = [
      ...this.webhooks,
      {
        id: webhookData.id,
        uri: webhookData.uri,
        name: webhookData.name,
        enabled: webhookData.enabled,
        secretKey: webhookData.secretKey,
        ssl: webhookData.ssl,
        triggers: webhookData.triggers,
        createdBy: webhookData.createdBy,
        targetId: webhookData.targetId,
      },
    ];
  };

  toggleEnabled = async (desiredWebhook: TWebhook, t: TTranslation) => {
    try {
      const res = await toggleEnabledWebhook(desiredWebhook);
      const index = this.webhooks.findIndex(
        (webhook) => webhook.id === desiredWebhook.id,
      );
      this.webhooks[index].enabled = !this.webhooks[index].enabled;
      toastr.success(
        this.webhooks[index].enabled
          ? t("WebhookEnabled")
          : t("WebhookDisabled"),
      );

      return res;
    } catch (error) {
      toastr.error(error as string);
    }
  };

  deleteWebhook = async (webhook: TWebhook) => {
    await removeWebhook(webhook.id);
    this.webhooks = this.webhooks.filter(
      (currentWebhook) => currentWebhook.id !== webhook.id,
    );
  };

  editWebhook = async (prevWebhook: TWebhook, webhookInfo: TWebhook) => {
    await updateWebhook(
      prevWebhook.id,
      webhookInfo.name,
      webhookInfo.uri,
      webhookInfo.secretKey || prevWebhook.secretKey,
      webhookInfo.ssl,
      webhookInfo.triggers,
      webhookInfo.targetId,
    );
    this.webhooks = this.webhooks.map((webhook) =>
      webhook.id === prevWebhook.id
        ? { ...prevWebhook, ...webhookInfo }
        : webhook,
    );
  };

  fetchConfigName = async (params: TJournalParams) => {
    const historyData = (await getWebhooksJournal({
      ...params,
      startIndex: 0,
      count: 1,
    })) as TJournalData;

    this.configName = historyData.items[0]?.configName || "";
  };

  clearConfigName = () => {
    this.configName = "";
  };

  fetchHistoryItems = async (params: TJournalParams) => {
    this.totalItems = 0;
    this.startIndex = 0;
    const count = params.count ? params.count : this.FETCH_COUNT;
    const historyData = (await getWebhooksJournal({
      ...params,
      startIndex: this.startIndex,
      count,
    })) as TJournalData;
    runInAction(() => {
      this.startIndex = count;
      this.historyItems = historyData.items;
      this.totalItems = historyData.total;
    });
  };

  fetchMoreItems = async (params: TJournalParams) => {
    const count = params.count ? params.count : this.FETCH_COUNT;
    const historyData = (await getWebhooksJournal({
      ...params,
      startIndex: this.startIndex,
      count,
    })) as TJournalData;
    runInAction(() => {
      this.startIndex += count;
      this.historyItems = [...this.historyItems, ...historyData.items];
    });
  };

  fetchEventData = async (eventId: number) => {
    const data = (await getWebhooksJournal({ eventId })) as TJournalData;
    this.eventDetails = data.items[0];
  };

  get hasMoreItems() {
    return this.totalItems > this.startIndex;
  }

  get isWebhooksEmpty() {
    return this.webhooks.length === 0;
  }

  setHistoryFilters = (filters: TWebhookHistoryFilters | null) => {
    this.historyFilters = filters;
  };

  clearHistoryFilters = () => {
    this.historyFilters = null;
  };

  clearDate = () => {
    // historically spread a possibly-null historyFilters;
    // non-null assertions keep the same runtime shape.
    this.historyFilters = { ...this.historyFilters!, deliveryDate: null };
  };

  unselectStatus = (statusCode: number) => {
    this.historyFilters = {
      ...this.historyFilters!,
      status: this.historyFilters!.status.filter(
        (item) => item !== statusCode,
      ),
    };
  };

  toggleEventId = (id: number) => {
    this.checkedEventIds = this.checkedEventIds.includes(id)
      ? this.checkedEventIds.filter((checkedId) => checkedId !== id)
      : [...this.checkedEventIds, id];
  };

  isIdChecked = (id: number) => {
    return this.checkedEventIds.includes(id);
  };

  checkAllIds = () => {
    this.checkedEventIds = this.historyItems.map((event) => event.id);
  };

  emptyCheckedIds = () => {
    this.checkedEventIds = [];
  };

  get areAllIdsChecked() {
    return this.checkedEventIds.length === this.historyItems.length;
  }

  get isIndeterminate() {
    return this.checkedEventIds.length > 0 && !this.areAllIdsChecked;
  }

  get isGroupMenuVisible() {
    return this.checkedEventIds.length !== 0;
  }
}

export default WebhooksStore;
