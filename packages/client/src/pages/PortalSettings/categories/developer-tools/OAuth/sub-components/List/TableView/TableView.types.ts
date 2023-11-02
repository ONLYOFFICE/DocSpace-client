import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

export interface TableViewProps {
  items: IClientProps[];
  sectionWidth: number;

  userId?: string;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: any,
    item: IClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  bufferSelection?: IClientProps | null;
  activeClients?: string[];
  hasNextPage?: boolean;
  itemCount?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface HeaderProps {
  sectionWidth: number;
  tableRef: HTMLDivElement;
  columnStorageName: string;
  tagRef: (node: HTMLDivElement) => void;
}

export interface RowProps {
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  tagCount: number;
  getContextMenuItems?: (
    t: any,
    item: IClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}
