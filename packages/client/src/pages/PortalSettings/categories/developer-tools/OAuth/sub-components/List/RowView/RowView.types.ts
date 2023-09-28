import { ClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface RowViewProps {
  items: ClientProps[];
  sectionWidth: number;
  viewAs?: ViewAsType;
  setViewAs?: (value: ViewAsType) => void;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: any,
    item: ClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  activeClients?: string[];
  hasNextPage?: boolean;
  totalElements?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowProps {
  item: ClientProps;
  isChecked: boolean;
  inProgress: boolean;
  sectionWidth: number;
  getContextMenuItems?: (
    t: any,
    item: ClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowContentProps {
  sectionWidth: number;
  item: ClientProps;
  isChecked: boolean;
  inProgress: boolean;
  handleToggleEnabled: () => void;
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}
