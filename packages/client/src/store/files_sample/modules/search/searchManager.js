import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { SEARCH_FILTER_TYPE } from "@docspace/shared/constants";

export class SearchManager {
  searchResults = [];
  searchQuery = "";
  searchFilter = {
    startIndex: 0,
    count: 25,
    filterType: SEARCH_FILTER_TYPE.None,
    searchInContent: false
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  setSearchQuery = (query) => {
    this.searchQuery = query;
    if (!query) {
      this.clearSearch();
    }
  };

  setSearchFilter = (filter) => {
    this.searchFilter = { ...this.searchFilter, ...filter };
  };

  search = async () => {
    if (!this.searchQuery) {
      this.clearSearch();
      return [];
    }

    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "search",
        () => api.files.search({
          ...this.searchFilter,
          query: this.searchQuery
        })
      );

      this.setSearchResults(response.data.items);
      return response.data.items;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Search");
      throw err;
    }
  };

  searchMore = async () => {
    if (!this.searchQuery) return [];

    try {
      this.searchFilter.startIndex += this.searchFilter.count;
      
      const response = await this.rootStore.loadingManager.withLoading(
        "search-more",
        () => api.files.search({
          ...this.searchFilter,
          query: this.searchQuery
        })
      );

      this.appendSearchResults(response.data.items);
      return response.data.items;
    } catch (err) {
      this.searchFilter.startIndex -= this.searchFilter.count;
      this.rootStore.errorHandler.handleError(err, "Search more");
      throw err;
    }
  };

  searchInFolder = async (folderId) => {
    if (!this.searchQuery) {
      this.clearSearch();
      return [];
    }

    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "search-in-folder",
        () => api.files.searchInFolder(folderId, {
          ...this.searchFilter,
          query: this.searchQuery
        })
      );

      this.setSearchResults(response.data.items);
      return response.data.items;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Search in folder");
      throw err;
    }
  };

  searchByTags = async (tags) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "search-by-tags",
        () => api.files.searchByTags(tags, this.searchFilter)
      );

      this.setSearchResults(response.data.items);
      return response.data.items;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Search by tags");
      throw err;
    }
  };

  setSearchResults = (results) => {
    this.searchResults = results;
  };

  appendSearchResults = (results) => {
    this.searchResults = [...this.searchResults, ...results];
  };

  clearSearch = () => {
    this.searchResults = [];
    this.searchQuery = "";
    this.searchFilter = {
      startIndex: 0,
      count: 25,
      filterType: SEARCH_FILTER_TYPE.None,
      searchInContent: false
    };
  };

  get hasMoreResults() {
    return this.searchResults.length >= this.searchFilter.count;
  }

  get currentSearchResults() {
    return this.searchResults;
  }

  get currentSearchQuery() {
    return this.searchQuery;
  }

  get currentSearchFilter() {
    return this.searchFilter;
  }
}

export default SearchManager;
