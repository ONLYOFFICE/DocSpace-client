class RoomsFilter {
  constructor() {
    this.filterValue = "";
    this.pageCount = 25;
    this.sortBy = "name";
    this.sortOrder = "ascending";
    this.total = 0;
    this.page = 0;
  }

  static getDefault() {
    return new RoomsFilter();
  }

  clone() {
    return Object.assign(new RoomsFilter(), this);
  }

  toApiUrlParams() {
    return "";
  }
}

export const toJSON = (filter) => {
  return JSON.stringify(filter);
};

export default RoomsFilter;
