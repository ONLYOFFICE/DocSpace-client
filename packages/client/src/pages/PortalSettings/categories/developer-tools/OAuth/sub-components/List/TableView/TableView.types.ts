import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { TTranslation } from "@docspace/shared/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";

import OAuthStore from "SRC_DIR/store/OAuthStore";

export interface TableViewProps {
  items: IClientProps[];
  sectionWidth: number;

  userId?: string;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  setBufferSelection?: OAuthStore["setBufferSelection"];
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
  ) => ContextMenuModel[];
  bufferSelection?: IClientProps | null;
  activeClients?: string[];
  hasNextPage?: boolean;
  itemCount?: number;
  fetchNextClients?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
  isGroupDialogVisible?: boolean;
  setDisableDialogVisible?: OAuthStore["setDisableDialogVisible"];
}

export interface HeaderProps {
  sectionWidth: number;
  tableRef: HTMLDivElement | null;
  columnStorageName: string;
  tagRef: (node: HTMLDivElement) => void;
}

export interface RowProps {
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  tagCount: number;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
  ) => ContextMenuModel[];
  setSelection?: (clientId: string) => void;
  setBufferSelection?: OAuthStore["setBufferSelection"];
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
  setDisableDialogVisible?: OAuthStore["setDisableDialogVisible"];
}
