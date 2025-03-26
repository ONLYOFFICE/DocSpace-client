import { makeAutoObservable, runInAction } from "mobx";
import FlowsApi from "@docspace/shared/api/flows/flows.api";
import type {
  Flow,
  FlowsFolder,
  FlowFilters,
  Node,
  CreateFlowParams,
} from "@docspace/shared/api/flows/flows.types";
import { getCookie } from "@docspace/shared/utils/cookie";
import { TFile } from "@docspace/shared/api/files/types";
import { toastr } from "@docspace/shared/components/toast";

type VectorizeDocumentStatus = "added" | "error" | "exist" | "not_found";

const RAG_CHAT_NAME = "docspace_chat";
const VECTORIZE_DOCUMENT_NAME = "vectorize_document";
const CHECK_VECTORIZE_DOCUMENT_NAME = "check_vectorize_document";
const API_KEY_NAME = "chat_api_key";

class FlowStore {
  private api: FlowsApi;

  flows: Flow[] = [];

  flowsFolders: FlowsFolder[] = [];

  isLoading: boolean = false;

  error: Error | null = null;

  ragChatID: string = "";

  vectorizeDocumentID: string = "";

  checkVectorizeDocumentID: string = "";

  apiKey: string = "";

  vectorizedFiles: TFile[] = [];

  constructor() {
    this.api = new FlowsApi("/onlyflow/api/v1");
    makeAutoObservable(this);
  }

  autoLogin = async () => {
    try {
      this.isLoading = true;
      await this.api.autoLogin();

      this.ragChatID = getCookie(RAG_CHAT_NAME) ?? "";
      this.vectorizeDocumentID = getCookie(VECTORIZE_DOCUMENT_NAME) ?? "";
      this.checkVectorizeDocumentID =
        getCookie(CHECK_VECTORIZE_DOCUMENT_NAME) ?? "";

      this.apiKey = getCookie(API_KEY_NAME) ?? "";

      this.api.setApiKey(this.apiKey);
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

  createFlow = async (flow: CreateFlowParams) => {
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
      const updatedFlow = await this.api.updateFlow({ id: flowId, ...flow });

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

  run = async (flow: Flow) => {
    try {
      this.isLoading = true;
      await this.api.runFlow(flow);

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

  vectorizeDocument = async (file: TFile) => {
    const response = await this.api.simpleRunFlow(
      this.vectorizeDocumentID,
      String(file.id),
      "text",
      "text",
      {},
    );

    const msg = response.outputs[0].outputs[0].messages[0]
      .message as VectorizeDocumentStatus;

    return msg;
  };

  checkVectorizeDocument = async (file: TFile) => {
    if (!this.apiKey || !this.checkVectorizeDocumentID) {
      setTimeout(() => {
        this.checkVectorizeDocument(file);
      }, 1000);
      return;
    }

    const isFileExists = this.vectorizedFiles.some(
      (f) => f.id === file.id && f.version === file.version,
    );

    if (isFileExists) return;

    const response = await this.api.simpleRunFlow(
      this.checkVectorizeDocumentID,
      String(file.id),
      "text",
      "text",
      {},
    );

    const msg = response.outputs[0].outputs[0].messages[0]
      .message as VectorizeDocumentStatus;

    if (msg === "exist") {
      this.vectorizedFiles = [...this.vectorizedFiles, file];

      return;
    }

    if (msg === "error") {
      toastr.error(`Error vectorizing document: ${file.title}`);
      return;
    }

    if (msg === "not_found") {
      console.log("start");
      const newMsg = await this.vectorizeDocument(file);
      console.log(newMsg);

      if (newMsg === "error") {
        toastr.error(`Error vectorizing document: ${file.title}`);
        return;
      }

      if (newMsg === "added") {
        toastr.success(`Document vectorized: ${file.title}`);
        this.vectorizedFiles = [...this.vectorizedFiles, file];
      }

      if (newMsg === "exist") {
        console.log("file exist");
        this.vectorizedFiles = [...this.vectorizedFiles, file];
      }
    }
  };

  localCheckVectorizeDocument = (file: TFile) => {
    if (
      this.vectorizedFiles.some(
        (f) => f.id === file.id && f.version === file.version,
      )
    )
      return true;
    return false;
  };
}

export default FlowStore;
