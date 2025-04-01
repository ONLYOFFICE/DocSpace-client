export interface FlowsFolder {
  description: string;
  id: string;
  name: string;
  parent_id: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  data: FlowData;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  folder_id?: string;
  endpoint_name?: string;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
}

export enum BuildStatus {
  BUILDING = "BUILDING",
  TO_BUILD = "TO_BUILD",
  BUILT = "BUILT",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

export type NodeDataType = {
  showNode?: boolean;
  type: string;
  node: unknown;
  id: string;
  output_types?: string[];
  selected_output_type?: string;
  buildStatus?: BuildStatus;
};

export interface Node {
  id: string;
  type: string;
  position: Position;
  data: NodeDataType;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CreateFlowParams {
  name: string;
  description?: string;
  data: FlowData;
  is_public?: boolean;
  folder_id?: string;
  endpoint_name?: string;
}

export interface UpdateFlowParams extends Partial<CreateFlowParams> {
  id: string;
}

export interface FlowListResponse {
  items: Flow[];
  total: number;
  page: number;
  size: number;
}

export interface FlowFilters {
  remove_example_flows?: boolean;
  components_only?: boolean;
  get_all?: boolean;
  folder_id?: string;
  header_flows?: boolean;
}

export interface RunFlowResponse {
  result: unknown;
  message?: string;
  error?: string;
}

export interface SimpleRunFlowResponse {
  session_id: string;
  outputs: Array<{
    inputs: Record<string, unknown>;
    outputs: Array<{
      results: {
        message: {
          text_key: string;
          data: {
            timestamp: string;
            sender: string;
            sender_name: string;
            session_id: string;
            text: string;
            files: unknown[];
            error: boolean;
            edit: boolean;
            properties: {
              text_color: string;
              background_color: string;
              edited: boolean;
              source: {
                id: string;
                display_name: string;
                source: string;
              };
              icon: string;
              allow_markdown: boolean;
              positive_feedback: null | unknown;
              state: string;
              targets: unknown[];
            };
            category: string;
            content_blocks: unknown[];
            id: string;
            flow_id: string;
          };
          default_value: string;
          text: string;
          sender: string;
          sender_name: string;
          files: unknown[];
          session_id: string;
          timestamp: string;
          flow_id: string;
          error: boolean;
          edit: boolean;
          properties: {
            text_color: string;
            background_color: string;
            edited: boolean;
            source: {
              id: string;
              display_name: string;
              source: string;
            };
            icon: string;
            allow_markdown: boolean;
            positive_feedback: null | unknown;
            state: string;
            targets: unknown[];
          };
          category: string;
          content_blocks: unknown[];
        };
      };
      artifacts: {
        message: string;
        sender: string;
        sender_name: string;
        files: unknown[];
        type: string;
      };
      outputs: {
        message: {
          message: string;
          type: string;
        };
      };
      logs: {
        message: unknown[];
      };
      messages: Array<{
        message: string;
        sender: string;
        sender_name: string;
        session_id: string;
        stream_url: null | string;
        component_id: string;
        files: [];
        type: string;
      }>;
      timedelta: null | number;
      duration: null | number;
      component_display_name: string;
      component_id: string;
      used_frozen_result: boolean;
    }>;
  }>;
}

export interface Tweaks {
  [key: string]: Record<string, unknown>;
}

export interface RunFlowOptions {
  input_value?: string | unknown;
  output_type?: string;
  input_type?: string;
  tweaks?: Tweaks;
  stream?: boolean;
}

export type Message = {
  flow_id: string;
  text: string;
  sender: string;
  sender_name: string;
  session_id: string;
  timestamp: string;
  files: Array<string>;
  id: string;
  edit: boolean;
  background_color: string;
  text_color: string;
  category?: string;
  properties?: unknown;
  content_blocks?: ContentBlock[];
};

// Base content type
export interface BaseContent {
  type: string;
  duration?: number;
  header?: {
    title?: string;
    icon?: string;
  };
}

// Individual content types
export interface ErrorContent extends BaseContent {
  type: "error";
  component?: string;
  field?: string;
  reason?: string;
  solution?: string;
  traceback?: string;
}

export interface TextContent extends BaseContent {
  type: "text";
  text: string;
}

export interface MediaContent extends BaseContent {
  type: "media";
  urls: string[];
  caption?: string;
}

export interface JSONContent extends BaseContent {
  type: "json";
  data: Record<string, unknown>;
}

export interface CodeContent extends BaseContent {
  type: "code";
  code: string;
  language: string;
  title?: string;
}

export interface ToolContent extends BaseContent {
  type: "tool_use";
  name?: string;
  tool_input: Record<string, unknown>;
  output?: unknown;
  error?: unknown;
}

// Union type for all content types
export type ContentType =
  | ErrorContent
  | TextContent
  | MediaContent
  | JSONContent
  | CodeContent
  | ToolContent;

// Updated ContentBlock interface
export interface ContentBlock {
  title: string;
  contents: ContentType[];
  allow_markdown: boolean;
  media_url?: string[];
  component: string;
}
