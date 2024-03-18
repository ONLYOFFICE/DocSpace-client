// (c) Copyright Ascensio System SIA 2010-2024
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

const SHOW_LOADER_TIMER = 500;
const MIN_LOADER_TIMER = 500;

class ClientLoadingStore {
  isLoaded = false;
  firstLoad = true;

  isArticleLoading = true;

  isSectionHeaderLoading = false;
  isSectionFilterLoading = false;
  isSectionBodyLoading = false;

  isProfileLoaded = false;

  sectionHeaderTimer = null;
  sectionFilterTimer = null;
  sectionBodyTimer = null;

  pendingSectionLoaders = {
    header: false,
    filter: false,
    body: false,
  };

  startLoadingTime = {
    header: null,
    filter: null,
    body: null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setIsLoaded = (isLoaded) => {
    this.isLoaded = isLoaded;
  };

  setFirstLoad = (firstLoad) => {
    this.firstLoad = firstLoad;
  };

  setIsArticleLoading = (isArticleLoading, withTimer = true) => {
    if (!withTimer || !this.firstLoad)
      return (this.isArticleLoading = isArticleLoading);

    setTimeout(() => {
      this.setIsArticleLoading(isArticleLoading, false);
    }, MIN_LOADER_TIMER);
  };

  updateIsSectionHeaderLoading = (param) => {
    this.isSectionHeaderLoading = param;
  };

  updateIsSectionFilterLoading = (param) => {
    this.isSectionFilterLoading = param;
  };

  updateIsSectionBodyLoading = (param) => {
    this.isSectionBodyLoading = param;
  };

  setIsSectionHeaderLoading = (isSectionHeaderLoading, withTimer = true) => {
    if (isSectionHeaderLoading) {
      if (this.pendingSectionLoaders.header || this.isSectionHeaderLoading)
        return;
      if (this.sectionHeaderTimer) {
        return;
      }
      this.pendingSectionLoaders.header = isSectionHeaderLoading;
      this.startLoadingTime.header = new Date();
      if (withTimer && !this.firstLoad) {
        return (this.sectionHeaderTimer = setTimeout(() => {
          this.updateIsSectionHeaderLoading(isSectionHeaderLoading);
        }, SHOW_LOADER_TIMER));
      }
      this.updateIsSectionHeaderLoading(isSectionHeaderLoading);
    } else {
      this.pendingSectionLoaders.header = isSectionHeaderLoading;
      if (this.startLoadingTime.header) {
        const currentDate = new Date();

        let ms = Math.abs(
          this.startLoadingTime.header.getTime() - currentDate.getTime()
        );
        if (this.sectionHeaderTimer) {
          ms = Math.abs(ms - SHOW_LOADER_TIMER);
          clearTimeout(this.sectionHeaderTimer);
          this.sectionHeaderTimer = null;
        }

        if (ms < MIN_LOADER_TIMER)
          return setTimeout(() => {
            this.updateIsSectionHeaderLoading(false);
            this.sectionHeaderTimer = null;
            this.startLoadingTime.header = null;
          }, MIN_LOADER_TIMER - ms);
      }
      if (this.sectionHeaderTimer) {
        clearTimeout(this.sectionHeaderTimer);
        this.sectionHeaderTimer = null;
      }
      this.startLoadingTime.header = null;
      this.updateIsSectionHeaderLoading(false);
    }
  };

  setIsSectionFilterLoading = (isSectionFilterLoading, withTimer = true) => {
    if (isSectionFilterLoading) {
      if (this.pendingSectionLoaders.filter || this.isSectionFilterLoading)
        return;
      if (this.sectionFilterTimer) {
        return;
      }
      this.pendingSectionLoaders.filter = isSectionFilterLoading;

      this.startLoadingTime.filter = new Date();
      if (withTimer && !this.firstLoad) {
        return (this.sectionFilterTimer = setTimeout(() => {
          this.updateIsSectionFilterLoading(isSectionFilterLoading);
        }, SHOW_LOADER_TIMER));
      }

      this.updateIsSectionFilterLoading(isSectionFilterLoading);
    } else {
      this.pendingSectionLoaders.filter = isSectionFilterLoading;
      if (this.startLoadingTime.filter) {
        const currentDate = new Date();

        let ms = Math.abs(
          this.startLoadingTime.filter.getTime() - currentDate.getTime()
        );

        if (this.sectionFilterTimer) {
          ms = Math.abs(ms - SHOW_LOADER_TIMER);

          clearTimeout(this.sectionFilterTimer);
          this.sectionFilterTimer = null;
        }

        if (ms < MIN_LOADER_TIMER) {
          return setTimeout(() => {
            this.updateIsSectionFilterLoading(false);

            this.startLoadingTime.filter = null;
          }, MIN_LOADER_TIMER - ms);
        }
      }
      if (this.sectionFilterTimer) {
        clearTimeout(this.sectionFilterTimer);
        this.sectionFilterTimer = null;
      }

      this.startLoadingTime.filter = null;

      this.updateIsSectionFilterLoading(false);
    }
  };

  setIsSectionBodyLoading = (isSectionBodyLoading, withTimer = true) => {
    if (isSectionBodyLoading) {
      if (this.pendingSectionLoaders.body || this.isSectionBodyLoading) return;
      if (this.sectionBodyTimer) {
        return;
      }
      this.pendingSectionLoaders.body = isSectionBodyLoading;
      this.startLoadingTime.body = new Date();
      if (withTimer && !this.firstLoad) {
        return (this.sectionBodyTimer = setTimeout(() => {
          this.updateIsSectionBodyLoading(isSectionBodyLoading);
        }, SHOW_LOADER_TIMER));
      }
      this.updateIsSectionBodyLoading(isSectionBodyLoading);
    } else {
      this.pendingSectionLoaders.body = isSectionBodyLoading;
      if (this.startLoadingTime.body) {
        const currentDate = new Date();

        let ms = Math.abs(
          this.startLoadingTime.body.getTime() - currentDate.getTime()
        );

        if (this.sectionBodyTimer) {
          ms = Math.abs(ms - SHOW_LOADER_TIMER);

          clearTimeout(this.sectionBodyTimer);
          this.sectionBodyTimer = null;
        }

        if (ms < MIN_LOADER_TIMER)
          return setTimeout(() => {
            this.updateIsSectionBodyLoading(false);
            this.startLoadingTime.body = null;
          }, MIN_LOADER_TIMER - ms);
      }

      if (this.sectionBodyTimer) {
        clearTimeout(this.sectionBodyTimer);
        this.sectionBodyTimer = null;
      }

      this.startLoadingTime.body = null;
      this.updateIsSectionBodyLoading(false);
    }
  };

  updateIsProfileLoaded = (isLoaded) => {
    this.isProfileLoaded = isLoaded;
  };

  setIsProfileLoaded = (isProfileLoaded) => {
    setTimeout(() => {
      this.updateIsProfileLoaded(isProfileLoaded);
    }, MIN_LOADER_TIMER);
  };

  hideLoaders = () => {
    this.clearTimers();
    this.showHeaderLoader = false;
    this.showFilterLoader = false;
    this.showBodyLoader = false;
    this.isSectionHeaderLoading = false;
    this.isSectionFilterLoading = false;
    this.isSectionBodyLoading = false;
  };

  clearTimers = () => {
    clearTimeout(this.sectionHeaderTimer);
    clearTimeout(this.sectionFilterTimer);
    clearTimeout(this.sectionBodyTimer);
  };

  get isLoading() {
    return (
      this.isArticleLoading ||
      this.pendingSectionLoaders.header ||
      this.pendingSectionLoaders.filter ||
      this.pendingSectionLoaders.body
    );
  }

  get showArticleLoader() {
    return this.isArticleLoading;
  }

  get showProfileLoader() {
    return !this.isProfileLoaded;
  }

  get showHeaderLoader() {
    return this.isSectionHeaderLoading || this.showArticleLoader;
  }

  get showFilterLoader() {
    return this.isSectionFilterLoading || this.showHeaderLoader;
  }

  get showBodyLoader() {
    return this.isSectionBodyLoading || this.showFilterLoader;
  }
}

export default ClientLoadingStore;
