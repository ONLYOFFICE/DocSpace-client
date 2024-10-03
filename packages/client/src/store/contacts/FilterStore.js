// (c) Copyright Ascensio System SIA 2009-2024
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

import { action, makeObservable, observable } from "mobx";
import Filter from "@docspace/shared/api/people/filter";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

class FilterStore {
  userStore = null;

  filter = Filter.getDefault();

  constructor(userStore) {
    this.userStore = userStore;

    makeObservable(this, {
      filter: observable,
      setFilterParams: action,
      setFilterUrl: action,
      resetFilter: action,
      setFilter: action,
    });
  }

  setFilterUrl = (filter) => {
    const urlFilter = filter.toUrlParams();
    const newPath = combineUrl(`/accounts/people/filter?${urlFilter}`);

    if (window.location.pathname + window.location.search === newPath) return;

    window.history.replaceState(
      "",
      "",
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, newPath),
    );
  };

  setFilterParams = (data) => {
    this.setFilterUrl(data);
    this.setFilter(data);
  };

  resetFilter = () => {
    this.setFilter(Filter.getDefault());
  };

  setFilter = (filter) => {
    const key = `PeopleFilter=${this.userStore.user.id}`;
    const value = `${filter.sortBy},${filter.pageCount},${filter.sortOrder}`;
    localStorage.setItem(key, value);

    this.filter = filter;
  };

  get filterTotal() {
    return this.filter.total;
  }

  get isFiltered() {
    return (
      this.filter.activationStatus ||
      this.filter.employeeStatus ||
      this.filter.payments ||
      this.filter.search ||
      this.filter.role ||
      this.filter.accountLoginType ||
      this.filter.withoutGroup ||
      this.filter.group
    );
  }
}

export default FilterStore;
