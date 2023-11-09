import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

export interface RowViewProps {
  items: IClientProps[];
  sectionWidth: number;

  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: any,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  activeClients?: string[];
  hasNextPage?: boolean;
  itemCount?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowProps {
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  sectionWidth: number;
  getContextMenuItems?: (
    t: any,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowContentProps {
  sectionWidth: number;
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;

  setSelection?: (clientId: string) => void;
}
