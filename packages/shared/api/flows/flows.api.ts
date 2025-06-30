import axios, { AxiosInstance, ResponseType } from "axios";
import {
  Flow,
  FlowsFolder,
  CreateFlowParams,
  UpdateFlowParams,
  FlowFilters,
  RunFlowOptions,
  RunFlowResponse,
  Tweaks,
  Node,
  SimpleRunFlowResponse,
  Message,
  TEventDelivery,
  TAutoLogin,
  TVariable,
} from "./flows.types";
import { getCookie } from "../../utils/cookie";

import {
  VECTORIZE_FILE_ID,
  CHECK_FILE_ID,
  CHECK_FOLDER_ID,
  CHAT_ID,
  SUMMARIZE_FILE_ID,
  SAVE_TO_FILE_ID,
  SUMMARIZE_FILE_TO_TEXT_ID,
} from "./flows.constants";

let eventDelivery: TEventDelivery = "";

class FlowsApi {
  private api: AxiosInstance;

  private baseUrl: string;

  private config: { baseURL: string; headers: Record<string, string> };

  constructor(baseUrl: string = "/api/v1", apiKey: string = "") {
    this.baseUrl = baseUrl;

    this.config = {
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (apiKey) {
      this.config.headers["x-api-key"] = apiKey;
    }

    this.api = axios.create(this.config);
  }

  setApiKey(apiKey: string) {
    this.config.headers["x-api-key"] = apiKey;

    this.api = axios.create(this.config);
  }

  getHeaders(): Record<string, string> {
    // Get the access token from cookies using a traditional approach
    const accessToken = getCookie("access_token_lf");
    if (!accessToken) {
      throw new Error("Access token not found in cookies");
    }

    const headers: Record<string, string> = {};

    // Safely copy existing headers if they exist
    if (this.api.defaults.headers) {
      Object.assign(
        headers,
        this.api.defaults.headers as Record<string, string>,
      );
    }

    // Add authorization header
    headers.Authorization = `Bearer ${accessToken}`;

    return headers;
  }

  async autoLogin(): Promise<TAutoLogin> {
    const { data } = await this.api.get("/auto_login");

    return data;
  }

  async getFolders(): Promise<FlowsFolder[]> {
    const { data } = await this.api.get("/folders/");
    return data;
  }

  async getFlows(filters?: FlowFilters): Promise<Flow[]> {
    const { data } = await this.api.get("/flows/", {
      params: filters,
      headers: this.getHeaders(),
    });
    return data;
  }

  async getFlow(id: string): Promise<Flow> {
    const { data } = await this.api.get(`/flows/${id}`, {
      headers: this.getHeaders(),
    });
    return data;
  }

  async createFlow(params: CreateFlowParams): Promise<Flow> {
    const { data } = await this.api.post("/flows/", params, {
      headers: this.getHeaders(),
    });
    return data as Flow;
  }

  async updateFlow(params: UpdateFlowParams): Promise<Flow> {
    const { id, ...updateData } = params;
    const { data } = await this.api.patch(`/flows/${id}`, updateData, {
      headers: this.getHeaders(),
    });
    return data as Flow;
  }

  async deleteFlow(id: string): Promise<void> {
    await this.api.delete(`/flows/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async createFlows(flows: CreateFlowParams[]): Promise<Flow[]> {
    const { data } = await this.api.post(
      "/flows/batch",
      { flows },
      {
        headers: this.getHeaders(),
      },
    );
    return data as unknown as Flow[];
  }

  async deleteFlows(flowIds: string[]): Promise<{ deleted: number }> {
    const { data } = await this.api.delete("/flows/batch", {
      headers: this.getHeaders(),
      data: { flowIds },
    });
    return data as unknown as { deleted: number };
  }

  async uploadFlows(file: File, folderId?: string): Promise<Flow[]> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    const { data } = await this.api.post("/flows/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...this.getHeaders(),
      },
    });
    return data as unknown as Flow[];
  }

  async downloadFlows(flowIds: string[]): Promise<Blob> {
    const { data } = await this.api.get("/flows/download", {
      params: { flowIds },
      responseType: "blob",
      headers: this.getHeaders(),
    });
    return data as Blob;
  }

  async getExampleFlows(): Promise<Flow[]> {
    const { data } = await this.api.get("/flows/examples", {
      headers: this.getHeaders(),
    });
    return data as Flow[];
  }

  private static extractTweaksFromFlow(flow: Flow): Tweaks {
    const tweaks: Tweaks = {};

    // Extract tweaks from all nodes
    flow.data.nodes.forEach((node) => {
      tweaks[`${node.type}-${node.id}`] = {};
    });

    return tweaks;
  }

  private static findNodesByType(flow: Flow, type: string): Node[] {
    return flow.data.nodes.filter((node) => node.type === type);
  }

  private static determineIOTypes(flow: Flow): {
    inputType: string;
    outputType: string;
  } {
    // Default IO types
    let inputType = "string";
    let outputType = "string";

    // Find nodes for I/O
    const inputNodes = FlowsApi.findNodesByType(flow, "input");

    // Determine input type from the first input node
    if (inputNodes.length > 0) {
      const inputNode = inputNodes[0];
      if (inputNode.data && inputNode.data.type) {
        inputType = inputNode.data.type;
      }
    }

    // Determine output type from the first output node
    const outputNodes = FlowsApi.findNodesByType(flow, "output");
    if (outputNodes.length > 0) {
      const outputNode = outputNodes[0];
      if (outputNode.data && outputNode.data.type) {
        outputType = outputNode.data.type;
      }
    }

    return {
      inputType,
      outputType,
    };
  }

  async runFlow(
    flow: Flow,
    inputValue: string | unknown = "",
    options: Partial<RunFlowOptions> = {},
  ): Promise<RunFlowResponse> {
    try {
      if (!flow.id || !flow.data) {
        throw new Error("Invalid flow: missing required fields");
      }

      // Extract tweaks from flow
      const defaultTweaks = FlowsApi.extractTweaksFromFlow(flow);

      // Determine input and output types
      const { inputType, outputType } = FlowsApi.determineIOTypes(flow);

      // Merge default values with options
      const { tweaks = defaultTweaks, stream = false } = options;

      const endpoint = `/run/${flow.id}?stream=${stream}`;

      const payload = {
        inputValue,
        outputType,
        inputType,
        tweaks,
      };

      const response = await this.api.post(endpoint, JSON.stringify(payload));

      if ((response.data as unknown as { error: string }).error) {
        throw new Error(
          `Flow execution failed: ${(response.data as unknown as { error: string }).error}`,
        );
      }

      return response.data as unknown as RunFlowResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Type assertion for error response data
        const errorMessage =
          error.response?.data &&
          typeof error.response.data === "object" &&
          "error" in error.response.data
            ? (error.response.data as { error: string }).error
            : error.message;

        throw new Error(`API request failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  static getAPI(
    isV2: boolean = false,
    isStream: boolean = false,
  ): AxiosInstance {
    const xApiKey = getCookie("chat_api_key");
    const accessToken = getCookie("access_token_lf");

    const config: {
      baseURL: string;
      headers: Record<string, string>;
      responseType: ResponseType;
    } = {
      baseURL: isV2 ? "/onlyflow/api/v2" : "/onlyflow/api/v1",
      headers: { "Content-Type": "application/json" },
      responseType: "json",
    };

    if (xApiKey) {
      config.headers["x-api-key"] = xApiKey;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (isStream) {
      config.responseType = "stream";
    }

    const instance = axios.create(config);

    return instance;
  }

  static async uploadFile(
    formData: FormData,
    flowId: string,
  ): Promise<{ file_path: string }> {
    const response: { data: { file_path: string } } =
      await FlowsApi.getAPI().post(`files/upload/${flowId}`, formData);

    return response.data;
  }

  static async getMessages(
    flowId: string,
    aiSelectedFolder: string,
  ): Promise<Message[]> {
    const response: { data: unknown } = await FlowsApi.getAPI().get(
      `monitor/messages?flow_id=${flowId}&session_id=${aiSelectedFolder}`,
    );

    return response.data as Message[];
  }

  static async getFlow(flowId: string): Promise<Flow> {
    const response: { data: Flow } = await FlowsApi.getAPI().get(
      `flows/${flowId}`,
    );

    return response.data;
  }

  static async buildFlow(
    flowId: string,
    data: object,
    abortController: AbortController,
  ): Promise<ReadableStream<Uint8Array>> {
    const xApiKey = getCookie("chat_api_key");

    if (!eventDelivery) {
      const configResponse: { data: { event_delivery: TEventDelivery } } =
        await FlowsApi.getAPI().get("/config");

      eventDelivery = configResponse.data.event_delivery;
    }

    if (eventDelivery === "direct") {
      const response = await fetch(
        `/onlyflow/api/v1/build/${flowId}/flow?stream=true`,
        {
          method: "POST",
          body: JSON.stringify(data),
          signal: abortController.signal,
          headers: {
            "x-api-key": xApiKey!,
            Connection: "close",
            "Content-Type": "application/json",
          },
        },
      );

      return response.body as ReadableStream<Uint8Array>;
    }

    const buildResponse: { data: { job_id: string } } =
      await FlowsApi.getAPI().post(`/build/${flowId}/flow`, data);

    const jobId = buildResponse.data.job_id;

    const response = await fetch(
      `/onlyflow/api/v1/build/${jobId}/events?stream=true`,
      {
        method: "GET",
        signal: abortController.signal,
        headers: {
          "x-api-key": xApiKey!,
          Connection: "close",
          "Content-Type": "application/json",
        },
      },
    );

    return response.body as ReadableStream<Uint8Array>;
  }

  static async sendMessage(data: object, abortController: AbortController) {
    return FlowsApi.buildFlow(CHAT_ID, data, abortController);
  }

  static async simpleRunFlow(
    id: string,
    inputValue: string,
    inputType: string,
    outputType: string,
    tweaks?: Tweaks,
  ): Promise<SimpleRunFlowResponse> {
    try {
      if (!id) {
        throw new Error("Invalid flow: missing required fields");
      }

      const endpoint = `/run/${id}`;

      const payload = {
        input_value: inputValue,
        output_type: outputType,
        input_type: inputType,
        ...(tweaks ? { tweaks } : {}),
      };

      const response = await FlowsApi.getAPI().post(
        endpoint,
        JSON.stringify(payload),
      );

      if ((response.data as unknown as { error: string }).error) {
        throw new Error(
          `Flow execution failed: ${(response.data as unknown as { error: string }).error}`,
        );
      }

      return response.data as unknown as SimpleRunFlowResponse;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async vectorizeFile(
    inputValue: string,
  ): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(
      VECTORIZE_FILE_ID,
      String(inputValue),
      "text",
      "text",
      {},
    );
  }

  static async checkFile(inputValue: string): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(
      CHECK_FILE_ID,
      String(inputValue),
      "text",
      "text",
      {},
    );
  }

  static async checkFolder(inputValue: string): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(
      CHECK_FOLDER_ID,
      String(inputValue),
      "text",
      "text",
      {},
    );
  }

  static async summarizeFileToText(
    inputValue: string,
  ): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(
      SUMMARIZE_FILE_TO_TEXT_ID,
      String(inputValue),
      "text",
      "text",
      {},
    );
  }

  static async summarizeFileToFile(
    inputValue: string,
  ): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(
      SUMMARIZE_FILE_ID,
      String(inputValue),
      "text",
      "text",
      {},
    );
  }

  static async getSaveToFileFlow(): Promise<Flow> {
    return FlowsApi.getFlow(SAVE_TO_FILE_ID);
  }

  static async saveToFile(tweaks: Tweaks): Promise<SimpleRunFlowResponse> {
    return FlowsApi.simpleRunFlow(SAVE_TO_FILE_ID, "", "text", "text", tweaks);
  }

  static async addMessage(
    text: string,
    sender: string,
    sender_name: string,
    session_id: string,
    flow_id: string,
  ): Promise<Message[]> {
    const response: { data: Message[] } = await FlowsApi.getAPI().post(
      `monitor/messages`,
      {
        text,
        sender,
        sender_name,
        session_id,
        flow_id,
      },
    );

    return response.data;
  }

  static async createVariable(name: string, value: string): Promise<TVariable> {
    const res = await FlowsApi.getAPI().post("/variables/", {
      name,
      value,
      type: "str",
      default_fields: [],
    });

    return res.data as TVariable;
  }

  static async readVariable(name: string): Promise<TVariable | undefined> {
    try {
      const response = await FlowsApi.getAPI().get(`/variables/${name}`);

      const variable = response.data as TVariable;

      return variable;
    } catch (e: unknown) {
      console.log(e);
      return undefined;
    }
  }

  static async updateVariable(id: string, value: string): Promise<TVariable> {
    const response = await FlowsApi.getAPI().patch(`/variables/${id}`, {
      value,
      id,
      default_fields: [],
    });

    return response.data as TVariable;
  }
}

export default FlowsApi;
