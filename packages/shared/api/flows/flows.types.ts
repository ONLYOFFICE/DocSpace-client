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
