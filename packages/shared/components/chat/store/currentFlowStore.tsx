import React from "react";
import { makeAutoObservable } from "mobx";

import FlowsApi from "../../../api/flows/flows.api";

import { getCookie } from "../../../utils";

import { FlowType } from "../types/flow";

export default class CurrentFlowStore {
  flow: FlowType | null = null;

  flowId: string;

  messages: unknown[] = [];

  isLoading: boolean = true;

  constructor(flowId: string) {
    this.flowId = flowId;
    makeAutoObservable(this);
  }

  setFlow = (flow: FlowType | null) => {
    this.flow = flow;

    this.fetchMessages();
  };

  fetchMessages = async () => {
    const messages = await FlowsApi.getMessages(this.flowId);

    this.messages = messages as unknown[];

    this.isLoading = false;
  };
}

export const CurrentFlowStoreContext = React.createContext<CurrentFlowStore>(
  undefined!,
);

export const CurrentFlowStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const flowId = getCookie("docspace_ai_chat");

  const store = React.useMemo(
    () => new CurrentFlowStore(flowId || ""),
    [flowId],
  );

  React.useEffect(() => {
    store.fetchMessages();
  }, [store]);

  return (
    <CurrentFlowStoreContext.Provider value={store}>
      {children}
    </CurrentFlowStoreContext.Provider>
  );
};

export const useCurrentFlowStore = () => {
  return React.useContext(CurrentFlowStoreContext);
};
