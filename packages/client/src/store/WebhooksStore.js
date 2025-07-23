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

import { makeAutoObservable, runInAction } from "mobx";

import { toastr } from "@docspace/shared/components/toast";

import {
  createWebhook,
  getAllWebhooks,
  getWebhooksJournal,
  removeWebhook,
  toggleEnabledWebhook,
  updateWebhook,
} from "@docspace/shared/api/settings";

class WebhooksStore {
  settingsStore;

  webhooks = [];

  checkedEventIds = [];

  historyFilters = null;

  historyItems = [];

  startIndex = 0;

  totalItems = 0;

  currentWebhook = {};

  eventDetails = {};

  FETCH_COUNT = 100;

  isRetryPending = false;

  configName = "";

  constructor(settingsStore) {
    makeAutoObservable(this);

    this.settingsStore = settingsStore;
  }

  setRetryPendingFalse = () => {
    this.isRetryPending = false;
  };

  setRetryPendingTrue = () => {
    this.isRetryPending = true;
  };

  setCurrentWebhook = (webhook) => {
    this.currentWebhook = webhook;
  };

  loadWebhooks = async () => {
    const { passwordSettings, getPortalPasswordSettings } = this.settingsStore;

    try {
      const webhooksData = await getAllWebhooks();
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
      console.error(error);
    }
  };

  addWebhook = async (webhook) => {
    const webhookData = await createWebhook(
      webhook.name,
      webhook.uri,
      webhook.secretKey,
      webhook.ssl,
      webhook.triggers,
      webhook.targetId,
    );

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

  toggleEnabled = async (desiredWebhook, t) => {
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
      toastr.error(error);
    }
  };

  deleteWebhook = async (webhook) => {
    await removeWebhook(webhook.id);
    this.webhooks = this.webhooks.filter(
      (currentWebhook) => currentWebhook.id !== webhook.id,
    );
  };

  editWebhook = async (prevWebhook, webhookInfo) => {
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

  fetchConfigName = async (params) => {
    const historyData = await getWebhooksJournal({
      ...params,
      startIndex: 0,
      count: 1,
    });

    this.configName = historyData.items[0]?.configName || "";
  };

  clearConfigName = () => {
    this.configName = "";
  };

  fetchHistoryItems = async (params) => {
    this.totalItems = 0;
    this.startIndex = 0;
    const count = params.count ? params.count : this.FETCH_COUNT;
    const historyData = await getWebhooksJournal({
      ...params,
      startIndex: this.startIndex,
      count,
    });
    runInAction(() => {
      this.startIndex = count;
      this.historyItems = historyData.items;
      this.totalItems = historyData.total;
    });
  };

  fetchMoreItems = async (params) => {
    const count = params.count ? params.count : this.FETCH_COUNT;
    const historyData = await getWebhooksJournal({
      ...params,
      startIndex: this.startIndex,
      count,
    });
    runInAction(() => {
      this.startIndex += count;
      this.historyItems = [...this.historyItems, ...historyData.items];
    });
  };

  fetchEventData = async (eventId) => {
    const data = await getWebhooksJournal({ eventId });
    this.eventDetails = data.items[0];
  };

  get hasMoreItems() {
    return this.totalItems > this.startIndex;
  }

  get isWebhooksEmpty() {
    return this.webhooks.length === 0;
  }

  setHistoryFilters = (filters) => {
    this.historyFilters = filters;
  };

  clearHistoryFilters = () => {
    this.historyFilters = null;
  };

  clearDate = () => {
    this.historyFilters = { ...this.historyFilters, deliveryDate: null };
  };

  unselectStatus = (statusCode) => {
    this.historyFilters = {
      ...this.historyFilters,
      status: this.historyFilters.status.filter((item) => item !== statusCode),
    };
  };

  toggleEventId = (id) => {
    this.checkedEventIds = this.checkedEventIds.includes(id)
      ? this.checkedEventIds.filter((checkedId) => checkedId !== id)
      : [...this.checkedEventIds, id];
  };

  isIdChecked = (id) => {
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
