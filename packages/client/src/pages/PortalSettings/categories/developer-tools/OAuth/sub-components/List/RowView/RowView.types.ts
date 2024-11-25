import { TTranslation } from "@docspace/shared/types";
import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";

import OAuthStore, { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface RowViewProps {
  items: IClientProps[];
  sectionWidth: number;
  viewAs?: ViewAsType;
  setViewAs?: (value: ViewAsType) => void;
  selection?: string[];
  setSelection?: (clientId: string) => void;
  setBufferSelection?: OAuthStore["setBufferSelection"];
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
  ) => ContextMenuModel[];
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
    t: TTranslation,
    item: IClientProps,
  ) => ContextMenuModel[];
  setSelection?: (clientId: string) => void;
  setBufferSelection?: OAuthStore["setBufferSelection"];
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowContentProps {
  sectionWidth: number;
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  handleToggleEnabled: () => void;
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}
