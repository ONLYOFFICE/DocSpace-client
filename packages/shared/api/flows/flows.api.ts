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

  async getFolders(): Promise<FlowsFolder[]> {
    const { data } = await this.api.get("/folders/");
    return data;
  }

  async getFlows(filters?: FlowFilters): Promise<Flow[]> {
    const { data } = await this.api.get("/flows/", {
      params: filters,
    });
    return data;
  }

  async getFlow(id: string): Promise<Flow> {
    const { data } = await this.api.get(`/flows/${id}`);
    return data;
  }

  async createFlow(params: CreateFlowParams): Promise<Flow> {
    const { data } = await this.api.post("/flows/", params);
    return data;
  }

  async updateFlow(params: UpdateFlowParams): Promise<Flow> {
    const { id, ...updateData } = params;
    const { data } = await this.api.patch(`/flows/${id}`, updateData);
    return data;
  }

  async deleteFlow(id: string): Promise<void> {
    await this.api.delete(`/flows/${id}`);
  }

  async createFlows(flows: CreateFlowParams[]): Promise<Flow[]> {
    const { data } = await this.api.post("/flows/batch", { flows });
    return data;
  }

  async deleteFlows(flowIds: string[]): Promise<{ deleted: number }> {
    const { data } = await this.api.delete("/flows/batch", {
      data: { flow_ids: flowIds },
    });
    return data;
  }

  async uploadFlows(file: File, folderId?: string): Promise<Flow[]> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folder_id", folderId);
    }

    const { data } = await this.api.post("/flows/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }

  async downloadFlows(flowIds: string[]): Promise<Blob> {
    const { data } = await this.api.get("/flows/download", {
      params: { flow_ids: flowIds },
      responseType: "blob",
    });
    return data;
  }

  async getExampleFlows(): Promise<Flow[]> {
    const { data } = await this.api.get("/flows/examples");
    return data;
  }

  private extractTweaksFromFlow(flow: Flow): Tweaks {
    const tweaks: Tweaks = {};

    // Extract tweaks from all nodes
    flow.data.nodes.forEach((node) => {
      tweaks[`${node.type}-${node.id}`] = {};
    });

    return tweaks;
  }

  private findNodesByType(flow: Flow, type: string): Node[] {
    return flow.data.nodes.filter((node) =>
      node.type.toLowerCase().includes(type.toLowerCase()),
    );
  }

  private determineIOTypes(flow: Flow): {
    input_type: string;
    output_type: string;
  } {
    // Find input and output nodes
    const inputNodes = this.findNodesByType(flow, "input");
    const outputNodes = this.findNodesByType(flow, "output");

    // Determine input type
    let input_type = "chat"; // default value
    if (inputNodes.length > 0) {
      const inputNode = inputNodes[0];
      // Determine input type based on node type or data
      if (inputNode.type.toLowerCase().includes("text")) {
        input_type = "text";
      } else if (inputNode.type.toLowerCase().includes("file")) {
        input_type = "file";
      }
      // Add more types as needed
    }

    // Determine output type
    let output_type = "chat"; // default value
    if (outputNodes.length > 0) {
      const outputNode = outputNodes[0];
      if (outputNode.type.toLowerCase().includes("text")) {
        output_type = "text";
      } else if (outputNode.type.toLowerCase().includes("file")) {
        output_type = "file";
      }
      // Add more types as needed
    }

    return { input_type, output_type };
  }

  async runFlow(
    flow: Flow,
    input_value: string | unknown = "",
    options: Partial<RunFlowOptions> = {},
  ): Promise<RunFlowResponse> {
    try {
      if (!flow.id || !flow.data) {
        throw new Error("Invalid flow: missing required fields");
      }

      // Extract tweaks from flow
      const defaultTweaks = this.extractTweaksFromFlow(flow);

      // Determine input and output types
      const { input_type, output_type } = this.determineIOTypes(flow);

      // Merge default values with options
      const { tweaks = defaultTweaks, stream = false } = options;

      const endpoint = `/run/${flow.id}?stream=${stream}`;

      const payload = {
        input_value,
        output_type,
        input_type,
        tweaks,
      };

      const response = await this.api.post(endpoint, JSON.stringify(payload));

      if (response.data.error) {
        throw new Error(`Flow execution failed: ${response.data.error}`);
      }

      return response.data.result as RunFlowResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API request failed: ${error.response?.data?.error || error.message}`,
        );
      }
      throw error;
    }
  }

  setErrorHandler(handler: (error: any) => void): void {
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
