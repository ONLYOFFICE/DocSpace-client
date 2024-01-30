import { makeAutoObservable } from "mobx";

class BannerStore {
  isBannerVisible = false; // TODO: set to true by default if you need to enable SmartBanner

  constructor() {
    makeAutoObservable(this);
  }

  setIsBannerVisible = (visible: boolean) => {
    this.isBannerVisible = visible;
  };
}

export { BannerStore };
