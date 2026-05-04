"use client";

import React from "react";
import { makeAutoObservable } from "mobx";

import type {
  CustomContextMenuAction,
  CustomActionsConfig,
} from "@/types/forms";

class FormsCustomActionsStore {
  fileActions: CustomContextMenuAction[] = [];
  folderActions: CustomContextMenuAction[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setActions = (config: CustomActionsConfig) => {
    if (config.contextMenu?.file) {
      this.fileActions = config.contextMenu.file;
    }
    if (config.contextMenu?.folder) {
      this.folderActions = config.contextMenu.folder;
    }
  };
}

const FormsCustomActionsStoreContext =
  React.createContext<FormsCustomActionsStore | null>(null);

export const FormsCustomActionsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsCustomActionsStore(), []);
  return (
    <FormsCustomActionsStoreContext.Provider value={store}>
      {children}
    </FormsCustomActionsStoreContext.Provider>
  );
};

export const useFormsCustomActionsStore = () => {
  const store = React.useContext(FormsCustomActionsStoreContext);
  if (!store) throw new Error("FormsCustomActionsStore not provided");
  return store;
};
