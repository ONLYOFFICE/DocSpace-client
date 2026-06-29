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
import copy from "copy-to-clipboard";

import {
  getDocsConnectInfo,
  startDocsConnectTrial,
  buyDocsConnectPlan,
  getDocsConnectReportUrl,
} from "@docspace/shared/api/docs-connect";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Nullable, TTranslation } from "@docspace/shared/types";

export type BuyPlanMode = "trial" | "edit";

class DocsConnectStore {
  settingsStore: Nullable<SettingsStore> = null;

  info: Nullable<TDocsConnectInfo> = null;

  isLoading: boolean = true;

  error: Nullable<Error> = null;

  buyPlanPanelVisible: boolean = false;

  buyPlanMode: BuyPlanMode = "trial";

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setError = (error: Nullable<Error>) => {
    this.error = error;
  };

  fetchInfo = async () => {
    try {
      this.setIsLoading(true);
      this.setError(null);
      const info = await getDocsConnectInfo();
      runInAction(() => {
        this.info = info;
      });
    } catch (error) {
      toastr.error(error as Error);
      runInAction(() => {
        this.error = error as Error;
      });
    } finally {
      this.setIsLoading(false);
    }
  };

  openBuyPlan = (mode: BuyPlanMode) => {
    this.buyPlanMode = mode;
    this.buyPlanPanelVisible = true;
  };

  closeBuyPlan = () => {
    this.buyPlanPanelVisible = false;
  };

  startTrial = async () => {
    const info = await startDocsConnectTrial();
    runInAction(() => {
      this.info = info;
    });
  };

  buyPlan = async ({
    users,
    devPack,
    topUp,
  }: {
    users: number;
    devPack: boolean;
    topUp?: number;
  }) => {
    const info = await buyDocsConnectPlan({
      users,
      devPackEnabled: devPack,
      topUp,
    });
    runInAction(() => {
      this.info = info;
    });
    this.closeBuyPlan();
  };

  downloadReport = () => {
    window.open(getDocsConnectReportUrl(), "_self");
  };

  copyToClipboard = (value: string, t: TTranslation) => {
    if (!value) return;

    copy(value);
    toastr.success(t("Common:Copied"));
  };

  copySecretKey = (t: TTranslation) => {
    const secret = this.info?.config.security.secret;
    if (!secret) return;

    this.copyToClipboard(secret, t);
  };
}

export default DocsConnectStore;
