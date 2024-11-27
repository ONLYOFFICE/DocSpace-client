import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class QuotaManager {
  quotaInfo = null;
  isQuotaLoading = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchQuota = async () => {
    try {
      this.isQuotaLoading = true;
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-quota",
        () => api.files.getQuota()
      );
      this.setQuotaInfo(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch quota info");
      throw err;
    } finally {
      this.isQuotaLoading = false;
    }
  };

  updateQuota = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-quota",
        () => api.files.updateQuota()
      );
      this.setQuotaInfo(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update quota info");
      throw err;
    }
  };

  setQuotaInfo = (info) => {
    this.quotaInfo = info;
  };

  get usedSpace() {
    return this.quotaInfo?.usedSpace || 0;
  }

  get totalSpace() {
    return this.quotaInfo?.totalSpace || 0;
  }

  get availableSpace() {
    return this.quotaInfo?.availableSpace || 0;
  }

  get usagePercentage() {
    if (!this.quotaInfo || !this.quotaInfo.totalSpace) return 0;
    return (this.quotaInfo.usedSpace / this.quotaInfo.totalSpace) * 100;
  }

  get isQuotaExceeded() {
    return this.usagePercentage >= 100;
  }

  get isQuotaAlmostExceeded() {
    return this.usagePercentage >= 90;
  }

  clearQuota = () => {
    this.quotaInfo = null;
    this.isQuotaLoading = false;
  };
}

export default QuotaManager;
