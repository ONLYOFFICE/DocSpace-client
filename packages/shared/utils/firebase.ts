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

import firebase from "firebase/compat/app";
import "firebase/compat/remote-config";
import "firebase/compat/storage";
import "firebase/compat/database";

import { TFirebaseSettings } from "../api/settings/types";

const fetchTimeoutMillis =
  (typeof window !== "undefined" &&
    window.ClientConfig?.firebase?.fetchTimeoutMillis) ||
  3600000;
const minimumFetchIntervalMillis =
  (typeof window !== "undefined" &&
    window.ClientConfig?.firebase?.minimumFetchIntervalMillis) ||
  3600000;

class FirebaseHelper {
  remoteConfig: firebase.remoteConfig.RemoteConfig | null = null;

  firebaseConfig: TFirebaseSettings | null = null;

  firebaseStorage: firebase.storage.Storage | null = null;

  firebaseDB: firebase.database.Database | null = null;

  constructor(settings: TFirebaseSettings) {
    if (typeof window === "undefined") return;

    this.firebaseConfig = settings;

    if (!this.isEnabled) return;

    if (!firebase.apps.length) {
      if (this.config) firebase.initializeApp(this.config);
    } else {
      firebase.app();
    }

    this.firebaseStorage = firebase.storage();

    this.remoteConfig = firebase.remoteConfig();

    this.firebaseDB = firebase.database();

    this.remoteConfig.settings = {
      fetchTimeoutMillis,
      minimumFetchIntervalMillis,
    };

    this.remoteConfig.defaultConfig = {
      maintenance: false,
    };

    this.remoteConfig
      .ensureInitialized()
      .then(() => {
        console.log("Firebase Remote Config is initialized");
      })
      .catch((err) => {
        console.error("Firebase Remote Config failed to initialize", err);
      });
  }

  get config() {
    return this.firebaseConfig;
  }

  get isEnabled() {
    return (
      !!this.config &&
      !!this.config?.apiKey &&
      !!this.config?.authDomain &&
      !!this.config?.projectId &&
      !!this.config?.storageBucket &&
      !!this.config?.messagingSenderId &&
      !!this.config?.appId &&
      !window.navigator.userAgent.includes("ZoomWebKit") && // Disabled firebase for Zoom - unknown 403 error inside iframe
      !window.navigator.userAgent.includes("ZoomApps")
    );
  }

  get isEnabledDB() {
    return this.isEnabled && !!this.config?.databaseURL;
  }

  async checkMaintenance() {
    if (!this.isEnabled) return Promise.reject("Not enabled");

    // const res = await this.remoteConfig?.fetchAndActivate();
    await this.remoteConfig?.fetchAndActivate();
    // console.log("fetchAndActivate", res);
    const maintenance = this.remoteConfig?.getValue("maintenance");
    if (!maintenance) {
      return Promise.resolve(null);
    }
    return Promise.resolve(JSON.parse(maintenance.asString()));
  }

  async checkBar() {
    if (!this.isEnabled) return Promise.reject("Not enabled");

    // const res = await this.remoteConfig?.fetchAndActivate();
    await this.remoteConfig?.fetchAndActivate();
    const barValue = this.remoteConfig?.getValue("docspace_bar");
    const barString = barValue && barValue.asString();

    if (!barValue || !barString) {
      return Promise.resolve([]);
    }
    const list = JSON.parse(barString);

    if (!list || !(list instanceof Array)) return Promise.resolve([]);

    const bar = list.filter((element) => {
      return typeof element === "string" && element.length > 0;
    });

    return Promise.resolve(bar);
  }

  async checkCampaigns() {
    if (!this.isEnabled) return Promise.reject("Not enabled");

    // const res = await this.remoteConfig?.fetchAndActivate();
    await this.remoteConfig?.fetchAndActivate();

    const campaignsValue = this.remoteConfig?.getValue("docspace_campaigns");
    const campaignsString = campaignsValue && campaignsValue.asString();

    if (!campaignsValue || !campaignsString) {
      return Promise.resolve([]);
    }

    const list = JSON.parse(campaignsString);

    if (!list || !(list instanceof Array)) return Promise.resolve([]);

    const campaigns = list.filter((element) => {
      return typeof element === "string" && element.length > 0;
    });

    return Promise.resolve(campaigns);
  }

  async getCampaignsImages(campaign: string, isIcon: boolean) {
    const domain = this.config?.authDomain;
    if (isIcon) {
      return `https://${domain}/images/campaign.${campaign.toLowerCase()}.icon.svg`;
    }
    return `https://${domain}/images/campaign.${campaign.toLowerCase()}.svg`;
  }

  async getCampaignsTranslations(campaign: string, lng: string) {
    const domain = this.config?.authDomain;
    return `https://${domain}/locales/${lng}/Campaign${campaign}.json`;
  }

  async getCampaignConfig(campaign: string) {
    const domain = this.config?.authDomain;
    return `https://${domain}/configs/Campaign${campaign}.json`;
  }

  async sendCrashReport<T>(report: T) {
    try {
      const reportListRef = this.firebaseDB?.ref("reports");
      const newReportRef = reportListRef?.push();
      newReportRef?.set(report);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async sendToastReport<T>(report: T) {
    try {
      const toastListRef = this.firebaseDB?.ref("toasts");
      const newReportRef = toastListRef?.push();
      newReportRef?.set(report);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default FirebaseHelper;
