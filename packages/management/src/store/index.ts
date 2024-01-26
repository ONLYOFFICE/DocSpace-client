import { createContext, useContext } from "react";

import SpacesStore from "./SpacesStore";

import store from "client/store";
import { UserStore } from "@docspace/shared/store/UserStore";
import { BannerStore } from "@docspace/shared/store/BannerStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
const {
  authStore,
  userStore,
  bannerStore,
  settingsStore,
}: {
  userStore: UserStore;
  bannerStore: BannerStore;
  authStore: any;
  settingsStore: SettingsStore;
} = store;

export class RootStore {
  authStore = authStore;
  userStore = userStore;
  bannerStore = bannerStore;
  settingsStore = settingsStore;
  spacesStore = new SpacesStore(this.settingsStore);
}

export const RootStoreContext = createContext<RootStore | null>(null);

export const useStore = () => {
  const context = useContext(RootStoreContext);
  if (context === null) {
    throw new Error(
      "You have forgotten to wrap your root component with RootStoreProvider"
    );
  }

  return context;
};
