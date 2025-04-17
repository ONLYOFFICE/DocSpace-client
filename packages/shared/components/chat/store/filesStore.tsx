import React from "react";
import { makeAutoObservable } from "mobx";

import { TSelectorItem } from "../../selector/Selector.types";

export default class FilesStore {
  files: TSelectorItem[] = [];

  wrapperHeight: number = 0;

  flowId: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setFlowId = (flowId: string) => {
    this.flowId = flowId;
  };

  setFiles = (files: TSelectorItem[] = []) => {
    this.files = files;
  };

  removeFile = (file: TSelectorItem) => {
    this.files = this.files.filter((f) => f.id !== file.id);
  };

  clearFiles = () => {
    this.files = [];
  };

  setWrapperHeight = (height: number) => {
    this.wrapperHeight = height;
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
