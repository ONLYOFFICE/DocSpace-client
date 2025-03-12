import { makeAutoObservable, runInAction } from "mobx";
import FlowsApi from "@docspace/shared/api/flows/flows.api";
import type {
  Flow,
  FlowsFolder,
  FlowFilters,
  Node,
} from "@docspace/shared/api/flows/flows.types";

class FlowStore {
  private api: FlowsApi;

  flows: Flow[] = [];

  flowsFolders: FlowsFolder[] = [];

  isLoading: boolean = false;

  error: Error | null = null;

  constructor() {
    this.api = new FlowsApi("/onlyflow/api/v1");
    makeAutoObservable(this);
  }

  autoLogin = async () => {
    try {
      this.isLoading = true;
      await this.api.autoLogin();
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchFlows = async () => {
    try {
      this.isLoading = true;
      const filter: FlowFilters = {
        remove_example_flows: true,
        get_all: true,
      };

      const [flows, flowsFolders] = await Promise.all([
        this.api.getFlows(filter),
        this.api.getFolders(),
      ]);

      runInAction(() => {
        this.flows = flows;
        this.flowsFolders = flowsFolders;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  getFolderById = (id: string) => {
    return this.flowsFolders.find((f) => f.id === id);
  };

  isChatAvailable(flow?: Flow) {
    if (!flow) {
      return false;
    }

    return flow?.data?.nodes.some((node: Node) => {
      if (node.data.type === "ChatInput" || node.data.type === "ChatOutput") {
        return true;
      }

      return false;
    });
  }

  createFlow = async (flow: Partial<Flow>) => {
    try {
      this.isLoading = true;
      const newFlow = await this.api.createFlow(flow);

      runInAction(() => {
        this.flows.push(newFlow);
        this.error = null;
      });

      return newFlow;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  updateFlow = async (flowId: string, flow: Partial<Flow>) => {
    try {
      this.isLoading = true;
      const updatedFlow = await this.api.updateFlow(flowId, flow);

      runInAction(() => {
        const index = this.flows.findIndex((f) => f.id === flowId);
        if (index !== -1) {
          this.flows[index] = updatedFlow;
        }
        this.error = null;
      });

      return updatedFlow;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteFlow = async (flowId: string) => {
    try {
      this.isLoading = true;
      await this.api.deleteFlow(flowId);

      runInAction(() => {
        this.flows = this.flows.filter((f) => f.id !== flowId);
        this.error = null;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  run = async (flowId: string) => {
    try {
      this.isLoading = true;
      await this.api.runFlow(flowId);

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  clearError() {
    this.error = null;
  }
}

export default FlowStore;
