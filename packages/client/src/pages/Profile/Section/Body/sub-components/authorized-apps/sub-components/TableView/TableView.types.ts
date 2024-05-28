import { IClientProps } from "@docspace/shared/utils/oauth/interfaces";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";
import { TTranslation } from "@docspace/shared/types";

export interface TableViewProps {
  items: IClientProps[];
  sectionWidth: number;

  userId?: string;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean
  ) => ContextMenuModel[];
  bufferSelection?: IClientProps | null;
  activeClients?: string[];
  hasNextPage?: boolean;
  itemCount?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface HeaderProps {
  sectionWidth: number;
  tableRef: HTMLDivElement | null;
  columnStorageName: string;
  tagRef?: (node: HTMLDivElement) => void;
}

export interface RowProps {
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean
  ) => ContextMenuModel[];
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}
