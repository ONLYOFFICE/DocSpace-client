import { makeAutoObservable } from "mobx";

import api from "../api";
import { TTfa, TTfaType } from "../api/settings/types";

export interface ITfaStore {
  tfaSettings: TTfaType | null;
  smsAvailable: boolean | null;
  appAvailable: boolean | null;
  backupCodes: string[];
  tfaAndroidAppUrl: string;
  tfaIosAppUrl: string;
  tfaWinAppUrl: string;

  setTfaSettings: (type: TTfaType) => Promise<TTfa>;
  setBackupCodes: (codes: string[]) => void;
  getTfaType: () => Promise<TTfaType>;
}

class TfaStore implements ITfaStore {
  tfaSettings: TTfaType | null = null;

  smsAvailable: boolean | null = null;

  appAvailable: boolean | null = null;

  backupCodes: string[] = [];

  tfaAndroidAppUrl =
    "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2";

  tfaIosAppUrl = "https://apps.apple.com/app/google-authenticator/id388497605";

  tfaWinAppUrl =
    "https://www.microsoft.com/ru-ru/p/authenticator/9wzdncrfj3rj?rtc=1&activetab=pivot:overviewtab";

  constructor() {
    makeAutoObservable(this);
  }

  getTfaType = async () => {
    const res = await api.settings.getTfaSettings();
    const sms = res[0].enabled;
    const app = res[1].enabled;

    const type = sms ? "sms" : app ? "app" : "none";
    this.tfaSettings = type;
    this.smsAvailable = res[0].avaliable;
    this.appAvailable = res[1].avaliable;

    return type;
  };

  setTfaSettings = async (type: TTfaType) => {
    this.tfaSettings = type;
    const res = await api.settings.setTfaSettings(type);

    return res;
  };

  setBackupCodes = (codes: string[]) => {
    this.backupCodes = codes;
  };
}

export { TfaStore };
