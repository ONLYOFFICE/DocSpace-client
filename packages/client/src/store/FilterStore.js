import { action, makeObservable, observable } from "mobx";
import Filter from "@docspace/shared/api/people/filter";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

class FilterStore {
  filter = Filter.getDefault();

  constructor() {
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

    const isPeople = window.location.pathname.includes("/accounts/people");
    const module = isPeople ? "people" : "groups";
    const newPath = combineUrl(`/accounts/${module}/filter?${urlFilter}`);

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

  get isFilteredOnlyBySearch() {
    return this.filter.checkIfFilteredOnlyBySearch();
  }
}

export default FilterStore;
