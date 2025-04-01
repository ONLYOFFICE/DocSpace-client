import { Edge, Node, ReactFlowJsonObject } from "@xyflow/react";
import { BuildStatus } from "../enums";

export type FlowType = {
  name: string;
  id: string;
  data: ReactFlowJsonObject<AllNodeType, EdgeType> | null;
  description: string;
  endpoint_name?: string | null;
  style?: FlowStyleType;
  is_component?: boolean;
  last_tested_version?: string;
  updated_at?: string;
  date_created?: string;
  parent?: string;
  folder?: string;
  user_id?: string;
  icon?: string;
  gradient?: string;
  tags?: string[];
  icon_bg_color?: string;
  folder_id?: string;
  webhook?: boolean;
  locked?: boolean | null;
  public?: boolean;
  access_type?: "PUBLIC" | "PRIVATE" | "PROTECTED";
};

export type GenericNodeType = Node<NodeDataType, "genericNode">;
export type NoteNodeType = Node<NoteDataType, "noteNode">;

export type AllNodeType = GenericNodeType | NoteNodeType;
export type SetNodeType<T = "genericNode" | "noteNode"> =
  T extends "genericNode" ? GenericNodeType : NoteNodeType;

export type NoteClassType = Pick<
  APIClassType,
  "description" | "display_name" | "documentation" | "tool_mode" | "frozen"
> & {
  template: {
    backgroundColor?: string;
    [key: string]: unknown;
  };
  outputs?: OutputFieldType[];
};

export type NodeDataType = {
  showNode?: boolean;
  type: string;
  node: APIClassType;
  id: string;
  output_types?: string[];
  selected_output_type?: string;
  buildStatus?: BuildStatus;
};

export type NoteDataType = {
  showNode?: boolean;
  type: string;
  node: NoteClassType;
  id: string;
};

export type EdgeType = Edge<EdgeDataType, "default">;

export type EdgeDataType = {
  sourceHandle: SourceHandleType;
  targetHandle: TargetHandleType;
};

// FlowStyleType is the type of the style object that is used to style the
// Flow card with an emoji and a color.
export type FlowStyleType = {
  emoji: string;
  color: string;
  flow_id: string;
};

export type TweaksType = Array<
  {
    [key: string]: {
      output_key?: string;
    };
  } & FlowStyleType
>;

// right side
export type SourceHandleType = {
  baseClasses?: string[];
  dataType: string;
  id: string;
  output_types: string[];
  conditionalPath?: string | null;
  name: string;
};

// left side
export type TargetHandleType = {
  inputTypes?: string[];
  output_types?: string[];
  type: string;
  fieldName: string;
  name?: string;
  id: string;
  proxy?: { field: string; id: string };
};

export type OutputFieldProxyType = {
  id: string;
  name: string;
  nodeDisplayName: string;
};

export type OutputFieldType = {
  types: Array<string>;
  selected?: string;
  name: string;
  display_name: string;
  hidden?: boolean;
  proxy?: OutputFieldProxyType;
  allows_loop?: boolean;
  options?: { [key: string]: unknown };
};

export type APIClassType = {
  base_classes?: Array<string>;
  description: string;
  template: APITemplateType;
  display_name: string;
  icon?: string;
  edited?: boolean;
  is_input?: boolean;
  is_output?: boolean;
  conditional_paths?: Array<string>;
  input_types?: Array<string>;
  output_types?: Array<string>;
  custom_fields?: CustomFieldsType;
  beta?: boolean;
  legacy?: boolean;
  documentation: string;
  error?: string;
  official?: boolean;
  outputs?: Array<OutputFieldType>;
  frozen?: boolean;
  lf_version?: string;
  flow?: FlowType;
  field_order?: string[];
  tool_mode?: boolean;
  type?: string;
  [key: string]:
    | Array<string>
    | string
    | APITemplateType
    | boolean
    | FlowType
    | CustomFieldsType
    | boolean
    | undefined
    | Array<{ types: Array<string>; selected?: string }>;
};

export type APITemplateType = {
  [key: string]: InputFieldType;
};

export type InputFieldType = {
  type: string;
  required: boolean;
  placeholder?: string;
  list: boolean;
  show: boolean;
  readonly: boolean;
  password?: boolean;
  multiline?: boolean;
  value?: unknown;
  dynamic?: boolean;
  proxy?: { id: string; field: string };
  input_types?: Array<string>;
  display_name?: string;
  name?: string;
  real_time_refresh?: boolean;
  refresh_button?: boolean;
  refresh_button_text?: string;
  combobox?: boolean;
  info?: string;
  options?: string[];
  active_tab?: number;
  [key: string]: unknown;
  icon?: string;
  text?: string;
  temp_file?: boolean;
};

export type CustomFieldsType = {
  [key: string]: Array<string>;
};
