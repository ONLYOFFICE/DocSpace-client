import { createContext, useContext } from "react";

import SpacesStore from "./SpacesStore";

import store from "client/store";
import { IUserStore } from "@docspace/shared/store/UserStore";
const { auth: authStore, userStore }: { userStore: IUserStore; auth: any } =
  store;

export class RootStore {
  authStore = authStore;
  userStore = userStore;
  spacesStore = new SpacesStore(this.authStore);
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
