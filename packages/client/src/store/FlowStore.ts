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
import { ChatEvents } from "@docspace/shared/components/chat/enums";

type VectorizeDocumentStatus = "added" | "error" | "exist" | "not_found";

type SimpleFile = Pick<TFile, "id" | "version" | "title" | "fileExst">;

const API_KEY_NAME = "chat_api_key";

export const FILE_EXSTS = ["docx", "pdf", "xlsx", "txt"];

class FlowStore {
  private api: FlowsApi;

  aiChatIsVisible = false;

  flows: Flow[] = [];

  flowsFolders: FlowsFolder[] = [];

  isLoading: boolean = false;

  error: Error | null = null;

  apiKey: string = "";

  userId: string = "";

  vectorizedFiles: (TFile | SimpleFile)[] = [];

  wrongFiles: (TFile | SimpleFile)[] = [];

  constructor() {
    this.api = new FlowsApi("/onlyflow/api/v1");
    makeAutoObservable(this);
  }

  setAiChatIsVisible = (visible: boolean) => {
    this.aiChatIsVisible = visible;
  };

  autoLogin = async () => {
    try {
      this.isLoading = true;
      const data = await this.api.autoLogin();

      runInAction(() => {
        this.userId = data.user_id;
        this.apiKey = getCookie(API_KEY_NAME) ?? "";
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

  localCheckVectorizeDocument = (file: TFile | SimpleFile) => {
    if (
      this.vectorizedFiles.some(
        (f) => f.id === file.id && f.version === file.version,
      )
    )
      return true;

    if (
      this.wrongFiles.some(
        (f) => f.id === file.id && f.version === file.version,
      )
    )
      return true;

    return false;
  };

  checkVectorizeDocument = async (file: TFile) => {
    if (!this.apiKey) {
      setTimeout(() => {
        this.checkVectorizeDocument(file);
      }, 300);
      return;
    }

    const isFileExists = this.localCheckVectorizeDocument(file);

    if (isFileExists) return;

    try {
      const response = await FlowsApi.checkFile(String(file.id));

      const msg = response.outputs[0].outputs[0].messages[0]
        .message as VectorizeDocumentStatus;

      if (msg === "exist") {
        this.vectorizedFiles = [...this.vectorizedFiles, file];

        return;
      }

      if (msg === "error") {
        toastr.error(`Error vectorizing document: ${file.title}`);
        this.wrongFiles = [...this.wrongFiles, file];

        return;
      }

      if (msg === "not_found") {
        await this.vectorizeDocument(file);
      }
    } catch (error) {
      toastr.error(`Error vectorizing document: ${file.title}`);
      this.wrongFiles = [...this.wrongFiles, file];

      console.log(error);
    }
  };

  checkVectorizedDocuments = async (
    folderId: number | string,
    filesId: (SimpleFile | TFile)[],
  ) => {
    if (!this.apiKey) {
      setTimeout(() => {
        this.checkVectorizedDocuments(folderId, filesId);
      }, 300);
      return;
    }

    const response = await FlowsApi.checkFolder(String(folderId));

    const msg = response.outputs[0].outputs[0].messages[0]
      ?.message as VectorizeDocumentStatus;

    if (msg === "error") {
      toastr.error(`Error checking vectorized documents`);
      return;
    }

    if (!msg) {
      filesId.forEach((f) => {
        this.vectorizeDocument(f);
      });

      return;
    }

    const files: SimpleFile[] = msg
      .split(", ")
      .map((s) => {
        const [id, version] = s.split(":");

        const file = filesId.find(
          (f) => String(f.id) === id && String(f.version) === version,
        );

        if (file && !this.localCheckVectorizeDocument(file)) return file;

        return null;
      })
      .filter(Boolean) as SimpleFile[];

    filesId.forEach((f) => {
      const isFound = msg.includes(`${f.id}:${f.version}`);

      if (!isFound) this.vectorizeDocument(f);
    });

    this.vectorizedFiles = [...this.vectorizedFiles, ...files];
  };

  vectorizeDocument = async (file: TFile | SimpleFile) => {
    if (!FILE_EXSTS.includes(file.fileExst.replace(".", ""))) {
      this.wrongFiles = [...this.wrongFiles, file];
      return;
    }

    try {
      const response = await FlowsApi.vectorizeFile(String(file.id));

      const msg = response.outputs[0].outputs[0].messages[0]
        .message as VectorizeDocumentStatus;

      if (msg === "error") {
        toastr.error(`Error vectorizing document: ${file.title}`);
        this.wrongFiles = [...this.wrongFiles, file];

        return;
      }

      if (msg === "added") {
        toastr.success(`Document ready for chat: ${file.title}`);
        this.vectorizedFiles = [...this.vectorizedFiles, file];
      }

      if (msg === "exist") {
        this.vectorizedFiles = [...this.vectorizedFiles, file];
      }

      return msg;
    } catch (error) {
      toastr.error(`Error vectorizing document: ${file.title}`);
      this.wrongFiles = [...this.wrongFiles, file];

      console.log(error);
    }
  };

  summarizeToChat = async (file: TFile) => {
    if (!this.apiKey) {
      setTimeout(() => {
        this.summarizeToChat(file);
      }, 1000);
      return;
    }

    if (!this.aiChatIsVisible) {
      this.setAiChatIsVisible(true);
    }

    // Need to wait for ai chat to be visible
    setTimeout(async () => {
      const userEvent = new CustomEvent(ChatEvents.ADD_USER_MESSAGE, {
        detail: { file, isSummary: true },
      });
      window.dispatchEvent(userEvent);

      const res = await FlowsApi.summarizeFileToText(String(file.id));

      const msg = res.outputs[0].outputs[0].results.message;

      delete msg.data;

      const aiEvent = new CustomEvent(ChatEvents.ADD_AI_MESSAGE, {
        detail: msg,
      });

      window.dispatchEvent(aiEvent);
    }, 0);
  };

  summarizeToFile = async (file: TFile) => {
    if (!this.apiKey) {
      setTimeout(() => {
        this.summarizeToFile(file);
      }, 1000);
      return;
    }

    try {
      await FlowsApi.summarizeFileToFile(String(file.id));

      toastr.success(`Document summarized: ${file.title}`);
    } catch (error) {
      toastr.error(`Error summarizing document: ${file.title}`);
      console.log(error);
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
}

export default FlowStore;
