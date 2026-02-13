import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";
import { TTranslation } from "@docspace/shared/types";

export interface RowViewProps {
  items: IClientProps[];
  sectionWidth: number;

  selection?: string[];
  setSelection?: (clientId: string) => void;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean,
  ) => ContextMenuModel[];
  activeClients?: string[];
  hasNextPage?: boolean;
  itemCount?: number;
  fetchNextConsents?: (startIndex: number) => Promise<void>;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

export interface RowProps {
  item: IClientProps;
  isChecked: boolean;
  inProgress: boolean;
  sectionWidth: number;
  dataTestId?: string;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo: boolean,
    isSettings: boolean,
  ) => ContextMenuModel[];
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
