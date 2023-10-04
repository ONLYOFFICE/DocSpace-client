import { ClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface TableViewProps {
  items: ClientProps[];
  sectionWidth: number;
  viewAs?: ViewAsType;
  setViewAs?: (value: ViewAsType) => void;
  userId?: string;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: any,
    item: ClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  bufferSelection?: ClientProps | null;
  activeClients?: string[];
  hasNextPage?: boolean;
  totalElements?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface HeaderProps {
  sectionWidth: number;
  tableRef: HTMLDivElement;
  columnStorageName: string;
}

export interface RowProps {
  item: ClientProps;
  isChecked: boolean;
  inProgress: boolean;
  getContextMenuItems?: (
    t: any,
    item: ClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}
