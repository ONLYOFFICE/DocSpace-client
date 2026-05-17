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

import { SettingsStore } from "./SettingsStore";
import api from "../api";
import { TTfaType } from "../api/settings/types";

class TfaStore {
  tfaSettings: TTfaType | null = null;

  smsAvailable: boolean | null = null;

  appAvailable: boolean | null = null;

  backupCodes: string[] = [];

  settingsStore: SettingsStore = {} as SettingsStore;

  tfaAndroidAppUrl =
    "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2";

  tfaIosAppUrl = "https://apps.apple.com/app/google-authenticator/id388497605";

  tfaWinAppUrl =
    "https://www.microsoft.com/ru-ru/p/authenticator/9wzdncrfj3rj?rtc=1&activetab=pivot:overviewtab";

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  getTfaType = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getTfaSettings(abortController.signal);
      const sms = res[0].enabled;
      const app = res[1].enabled;

      const type = sms ? "sms" : app ? "app" : "none";
      this.tfaSettings = type;
      this.smsAvailable = res[0].available;
      this.appAvailable = res[1].available;

      return type;
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  setTfaSettings = async (type: TTfaType) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      this.tfaSettings = type;
      const res = await api.settings.setTfaSettings(
        type,
        abortController.signal,
      );

      return res;
    } catch (error) {
      if (axios.isCancel(error)) return;
      throw error;
    }
  };

  setBackupCodes = (codes: string[]) => {
    this.backupCodes = codes;
  };
}

export { TfaStore };

