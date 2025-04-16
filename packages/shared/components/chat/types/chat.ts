import { ContentBlock } from "../../../api/flows/flows.types";

import { FlowType } from "./flow";

export type ChatType = { flow: FlowType };
export type ChatMessageType = {
  message: string | object;
  template?: string;
  isSend: boolean;
  thought?: string;
  files?: Array<{ path: string; type: string; name: string } | string>;
  prompt?: string;
  chatKey?: string;
  componentId?: string;
  id: string;
  timestamp: string;
  stream_url?: string | null;
  sender_name?: string;
  session?: string;
  edit?: boolean;
  icon?: string;
  category?: string;
  properties?: PropertiesType;
  content_blocks?: ContentBlock[];
};

export type SourceType = {
  id: string;
  display_name: string;
  source: string;
};

export type PropertiesType = {
  source: SourceType;
  icon?: string;
  background_color?: string;
  text_color?: string;
  targets?: string[];
  edited?: boolean;
  allow_markdown?: boolean;
  state?: string;
  positive_feedback?: boolean | null;
};

export type ChatOutputType = {
  message: string;
  sender: string;
  sender_name: string;
  stream_url?: string;
  files?: Array<{ path: string; type: string; name: string }>;
};

export type ChatInputType = {
  message: string;
  sender: string;
  sender_name: string;
  stream_url?: string;
  files?: Array<{ path: string; type: string; name: string }>;
};

export type FlowPoolObjectType = {
  timestamp: string;
  valid: boolean;
  // list of chat outputs or list of chat inputs
  messages: Array<ChatOutputType | ChatInputType> | [];
  data: {
    artifacts: unknown;
    results: unknown | ChatOutputType | ChatInputType;
  };
  id: string;
};

export interface PlaygroundEvent {
  event_type: "message" | "error" | "warning" | "info" | "token";
  background_color?: string;
  text_color?: string;
  allow_markdown?: boolean;
  icon?: string | null;
  sender_name: string;
  content_blocks?: ContentBlock[] | null;
  files?: string[];
  text?: string;
  timestamp?: string;
  token?: string;
  id?: string;
  flow_id?: string;
  sender?: string;
  session_id?: string;
  edit?: boolean;
}

export type TModel = {
  id: string;
  name: string;
};
