import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
const { FilesFilter, RoomsFilter } = api;

export class FilterState {
  filter = FilesFilter.getDefault();
  roomsFilter = RoomsFilter.getDefault();
  membersFilter = {
    page: 0,
    pageCount: 100,
    total: 0,
    startIndex: 0,
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  setFilter = (filter) => {
    this.filter = { ...this.filter, ...filter };
  };

  resetFilter = () => {
    this.filter = FilesFilter.getDefault();
  };

  setRoomsFilter = (filter) => {
    this.roomsFilter = { ...this.roomsFilter, ...filter };
  };

  resetRoomsFilter = () => {
    this.roomsFilter = RoomsFilter.getDefault();
  };

  setMembersFilter = (filter) => {
    this.membersFilter = { ...this.membersFilter, ...filter };
  };

  resetMembersFilter = () => {
    this.membersFilter = {
      page: 0,
      pageCount: 100,
      total: 0,
      startIndex: 0,
    };
  };

  updateFilterPage = (page) => {
    this.filter.page = page;
  };

  updateRoomsFilterPage = (page) => {
    this.roomsFilter.page = page;
  };

  updateMembersFilterPage = (page) => {
    this.membersFilter.page = page;
  };

  get currentFilter() {
    return this.filter;
  }

  get currentRoomsFilter() {
    return this.roomsFilter;
  }

  get currentMembersFilter() {
    return this.membersFilter;
  }
}

export default FilterState;
