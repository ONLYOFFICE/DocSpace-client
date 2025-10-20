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
      this.smsAvailable = res[0].avaliable;
      this.appAvailable = res[1].avaliable;

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
