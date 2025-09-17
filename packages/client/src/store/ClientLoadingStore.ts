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
import { DeviceType } from "@docspace/shared/enums";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

const SHOW_LOADER_TIMER = 500;
const MIN_LOADER_TIMER = 500;

type SectionType = "header" | "tabs" | "filter" | "body";

interface LoaderState {
  isLoading: boolean;
  pendingLoaders: boolean;
  timer: NodeJS.Timeout | null;
  startTime: Date | null;
}

class ClientLoadingStore {
  isLoaded: boolean = false;

  firstLoad: boolean = true;

  isArticleLoading: boolean = true;

  isProfileLoaded: boolean = false;

  isPortalSettingsLoading: boolean = true;

  settingsStore: SettingsStore | null = null;

  loaderStates: Record<SectionType, LoaderState> = {
    header: {
      isLoading: false,
      pendingLoaders: false,
      timer: null,
      startTime: null,
    },
    tabs: {
      isLoading: false,
      pendingLoaders: false,
      timer: null,
      startTime: null,
    },
    filter: {
      isLoading: false,
      pendingLoaders: false,
      timer: null,
      startTime: null,
    },
    body: {
      isLoading: false,
      pendingLoaders: false,
      timer: null,
      startTime: null,
    },
  };

  isChangePageRequestRunning = false;

  currentClientView: "users" | "groups" | "files" | "chat" | "profile" | "" =
    "";

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  setIsChangePageRequestRunning = (isChangePageRequestRunning: boolean) => {
    this.isChangePageRequestRunning = isChangePageRequestRunning;
  };

  setIsPortalSettingsLoading = (isPortalSettingsLoading: boolean) => {
    this.isPortalSettingsLoading = isPortalSettingsLoading;
  };

  setCurrentClientView = (
    currentClientView: ClientLoadingStore["currentClientView"],
  ) => {
    this.currentClientView = currentClientView;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  setFirstLoad = (firstLoad: boolean) => {
    this.firstLoad = firstLoad;
  };

  setIsArticleLoading = (
    isArticleLoading: boolean,
    withTimer: boolean = true,
  ) => {
    if (!withTimer || !this.firstLoad) {
      this.isArticleLoading = isArticleLoading;

      return;
    }

    setTimeout(() => {
      this.setIsArticleLoading(isArticleLoading, false);
    }, window.ClientConfig?.loaders?.loaderTime ?? MIN_LOADER_TIMER);
  };

  setIsProfileLoaded = (
    isProfileLoaded: boolean,
    withTimer: boolean = true,
  ) => {
    if (!withTimer) {
      this.isProfileLoaded = isProfileLoaded;

      return;
    }

    setTimeout(() => {
      this.isProfileLoaded = isProfileLoaded;
    }, window.ClientConfig?.loaders?.loaderTime ?? MIN_LOADER_TIMER);
  };

  updateLoading = (type: SectionType, isLoading: boolean) => {
    this.loaderStates[type].isLoading = isLoading;
  };

  setIsLoading = (
    type: SectionType,
    isLoading: boolean,
    withTimer: boolean = true,
  ) => {
    if (isLoading) {
      this.loaderStates[type].pendingLoaders = isLoading;
      this.loaderStates[type].startTime = new Date();

      if (withTimer && !this.firstLoad) {
        if (this.loaderStates[type].timer) {
          clearTimeout(this.loaderStates[type].timer);
        }
        this.loaderStates[type].timer = setTimeout(() => {
          this.updateLoading(type, isLoading);
        }, window.ClientConfig?.loaders.showLoaderTime ?? SHOW_LOADER_TIMER);

        return;
      }
      this.updateLoading(type, isLoading);
    } else {
      this.loaderStates[type].pendingLoaders = isLoading;
      if (this.loaderStates[type].startTime) {
        const currentDate = new Date();

        let ms = Math.abs(
          this.loaderStates[type].startTime.getTime() - currentDate.getTime(),
        );

        if (this.loaderStates[type].timer) {
          ms = window.ClientConfig?.loaders.showLoaderTime
            ? Math.abs(ms - window.ClientConfig.loaders.showLoaderTime)
            : Math.abs(ms - SHOW_LOADER_TIMER);

          clearTimeout(this.loaderStates[type].timer);

          this.loaderStates[type].timer = null;
        }

        if (
          window.ClientConfig?.loaders?.loaderTime
            ? ms < window.ClientConfig?.loaders?.loaderTime
            : ms < MIN_LOADER_TIMER
        ) {
          setTimeout(
            () => {
              this.updateLoading(type, isLoading);
              this.loaderStates[type].timer &&
                clearTimeout(this.loaderStates[type].timer);
              this.loaderStates[type].startTime = null;
              this.loaderStates[type].timer = null;
            },
            window.ClientConfig?.loaders?.loaderTime
              ? window.ClientConfig.loaders.loaderTime - ms
              : MIN_LOADER_TIMER - ms,
          );

          return;
        }
      }

      if (this.loaderStates[type].timer) {
        clearTimeout(this.loaderStates[type].timer);
        this.loaderStates[type].timer = null;
      }

      this.loaderStates[type].startTime = null;
      this.updateLoading(type, isLoading);
    }
  };

  setIsSectionHeaderLoading = (
    isSectionHeaderLoading: boolean,
    withTimer: boolean = true,
  ) => {
    this.setIsLoading("header", isSectionHeaderLoading, withTimer);
  };

  setIsSectionTabsLoading = (
    isSectionTabsLoading: boolean,
    withTimer: boolean,
  ) => {
    this.setIsLoading("tabs", isSectionTabsLoading, withTimer);
  };

  setIsSectionFilterLoading = (
    isSectionFilterLoading: boolean,
    withTimer: boolean = true,
  ) => {
    this.setIsLoading("filter", isSectionFilterLoading, withTimer);
  };

  setIsSectionBodyLoading = (
    isSectionBodyLoading: boolean,
    withTimer: boolean = true,
  ) => {
    return;
    this.setIsLoading("body", isSectionBodyLoading, withTimer);
  };

  get isLoading() {
    return (
      this.isArticleLoading ||
      this.loaderStates.header.pendingLoaders ||
      this.loaderStates.tabs.pendingLoaders ||
      this.loaderStates.filter.pendingLoaders ||
      this.loaderStates.body.pendingLoaders
    );
  }

  get showArticleLoader(): boolean {
    return this.isArticleLoading;
  }

  get showHeaderLoader(): boolean {
    return this.loaderStates.header.isLoading || this.showArticleLoader;
  }

  get showTabsLoader(): boolean {
    return this.loaderStates.tabs.isLoading || this.showHeaderLoader;
  }

  get showFilterLoader(): boolean {
    return this.loaderStates.filter.isLoading || this.showTabsLoader;
  }

  get showBodyLoader(): boolean {
    return this.loaderStates.body.isLoading || this.showFilterLoader;
  }

  get showProfileLoader(): boolean {
    return this.showHeaderLoader || !this.isProfileLoaded;
  }

  get showPortalSettingsLoader(): boolean {
    const isMobileView = this.settingsStore?.deviceType === DeviceType.mobile;
    return this.isPortalSettingsLoading && !isMobileView;
  }
}

export default ClientLoadingStore;
