import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { parseHistory } from "SRC_DIR/pages/Home/InfoPanel/Body/helpers/HistoryHelper";

export class HistoryManager {
  history = [];
  historyFilter = {
    startIndex: 0,
    count: 25,
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
    });
  }

  fetchHistory = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-history-${fileId}`,
        () => api.files.getHistory(fileId, this.historyFilter),
      );

      const parsedHistory = parseHistory(response.data);
      this.setHistory(parsedHistory);
      return parsedHistory;
      // return this.rootStore.infoPanelState.fetchHistory(fileId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch history");
      throw err;
    }
  };

  fetchMoreHistory = async (fileId) => {
    try {
      this.historyFilter.startIndex += this.historyFilter.count;

      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-more-history-${fileId}`,
        () => api.files.getHistory(fileId, this.historyFilter),
      );

      const parsedHistory = parseHistory(response.data);
      this.appendHistory(parsedHistory);
      return parsedHistory;
    } catch (err) {
      this.historyFilter.startIndex -= this.historyFilter.count;
      this.rootStore.errorHandler.handleError(err, "Fetch more history");
      throw err;
    }
  };

  setHistory = (history) => {
    this.history = history;
  };

  appendHistory = (history) => {
    this.history = [...this.history, ...history];
  };

  clearHistory = () => {
    this.history = [];
    this.historyFilter = {
      startIndex: 0,
      count: 25,
    };
  };

  addHistoryEvent = (event) => {
    const parsedEvent = parseHistory([event])[0];
    this.history = [parsedEvent, ...this.history];
  };

  removeHistoryEvent = (eventId) => {
    this.history = this.history.filter((event) => event.id !== eventId);
  };

  updateHistoryEvent = (eventId, updates) => {
    this.history = this.history.map((event) =>
      event.id === eventId ? { ...event, ...updates } : event,
    );
  };

  get hasMoreHistory() {
    return this.history.length >= this.historyFilter.count;
  }

  get currentHistory() {
    return this.history;
  }

  get historyStartIndex() {
    return this.historyFilter.startIndex;
  }
}

export default HistoryManager;
