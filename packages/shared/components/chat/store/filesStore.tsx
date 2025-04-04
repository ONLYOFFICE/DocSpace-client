import React from "react";
import { makeAutoObservable } from "mobx";

import { TSelectedFileInfo } from "../../../selectors/Files/FilesSelector.types";

export default class FilesStore {
  file: TSelectedFileInfo | undefined;

  flowId: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setFlowId = (flowId: string) => {
    this.flowId = flowId;
  };

  setFile = (file?: TSelectedFileInfo) => {
    this.file = file;
  };
}

export const FilesStoreContext = React.createContext<FilesStore>(undefined!);

export const FilesStoreContextProvider = ({
  children,
  aiChatID,
}: {
  children: React.ReactNode;
  aiChatID: string;
}) => {
  const store = React.useMemo(() => new FilesStore(), []);

  React.useEffect(() => {
    store.setFlowId(aiChatID);
  }, [aiChatID, store]);

  return (
    <FilesStoreContext.Provider value={store}>
      {children}
    </FilesStoreContext.Provider>
  );
};

export const useFilesStore = () => {
  return React.useContext(FilesStoreContext);
};
