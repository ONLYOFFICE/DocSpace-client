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

    // const isPeople = window.location.pathname.includes("/accounts/people");
    // const module = isPeople ? "people" : "groups";
    const newPath = combineUrl(`/accounts/people/filter?${urlFilter}`);

    console.log(window.location.pathname + window.location.search === newPath);

    if (window.location.pathname + window.location.search === newPath) return;

    window.history.replaceState(
      "",
      "",
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, newPath),
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
