import React from "react";
import { makeAutoObservable } from "mobx";

import FlowsApi from "../../../api/flows/flows.api";

import { FlowType } from "../types/flow";

export default class CurrentFlowStore {
  flow: FlowType | null = null;

  flowId: string = "";

  messages: unknown[] = [];

  isLoading: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setFlowId = (flowId: string) => {
    this.flowId = flowId;
  };

  fetchFlow = async () => {
    const flow = await FlowsApi.getFlow(this.flowId);

    this.flow = flow as FlowType;
  };
}

export const CurrentFlowStoreContext = React.createContext<CurrentFlowStore>(
  undefined!,
);

export const CurrentFlowStoreContextProvider = ({
  children,
  aiChatID,
}: {
  children: React.ReactNode;
  aiChatID: string;
}) => {
  const store = React.useMemo(() => new CurrentFlowStore(), []);

  React.useEffect(() => {
    store.setFlowId(aiChatID);
    store.fetchFlow();
  }, [aiChatID, store]);

  return (
    <CurrentFlowStoreContext.Provider value={store}>
      {children}
    </CurrentFlowStoreContext.Provider>
  );
};

export const useCurrentFlowStore = () => {
  return React.useContext(CurrentFlowStoreContext);
};
