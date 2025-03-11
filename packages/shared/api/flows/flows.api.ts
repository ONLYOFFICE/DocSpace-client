import axios, { AxiosInstance } from "axios";
import {
  Flow,
  FlowsFolder,
  CreateFlowParams,
  UpdateFlowParams,
  // FlowListResponse,
  FlowFilters,
  RunFlowOptions,
  RunFlowResponse,
  Tweaks,
  Node,
} from "./flows.types";
import { getCookie } from "../../utils/cookie";

class FlowsApi {
  private api: AxiosInstance;

  private baseUrl: string;

  constructor(baseUrl: string = "/api/v1", apiKey: string = "") {
    this.baseUrl = baseUrl;

    const config: {
      baseURL: string;
      headers: Record<string, string>;
    } = {
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }

    this.api = axios.create(config);
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

  async autoLogin(): Promise<void> {
    const { data } = await this.api.get("/auto_login");
    console.log("autoLogin", { data });
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
    return data as Flow[];
  }

  async deleteFlows(flowIds: string[]): Promise<{ deleted: number }> {
    const { data } = await this.api.delete("/flows/batch", {
      headers: this.getHeaders(),
      data: { flowIds },
    });
    return data as { deleted: number };
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
    return data as Flow[];
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

      if (response.data.error) {
        throw new Error(`Flow execution failed: ${response.data.error}`);
      }

      return response.data.result as RunFlowResponse;
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

  setErrorHandler(handler: (error: unknown) => void): void {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        handler(error);
        return Promise.reject(error);
      },
    );
  }
}

export default FlowsApi;
