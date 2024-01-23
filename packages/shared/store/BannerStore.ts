import { makeAutoObservable } from "mobx";

export interface IBannerStore {
  isBannerVisible: boolean;

  setIsBannerVisible: (visible: boolean) => void;
}

class BannerStore implements IBannerStore {
  isBannerVisible = false; // TODO: set to true by default if you need to enable SmartBanner

  constructor() {
    makeAutoObservable(this);
  }

  setIsBannerVisible = (visible: boolean) => {
    this.isBannerVisible = visible;
  };
}

export { BannerStore };
