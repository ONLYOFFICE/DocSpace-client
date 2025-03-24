import React from "react";
import { TUser } from "@docspace/shared/api/people/types";
import {
  TApiKey,
  TApiKeyParamsRequest,
} from "@docspace/shared/api/api-keys/types";
import { DeviceType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { TColorScheme } from "@docspace/shared/themes";

export type ApiKeysProps = {
  t: TTranslation;
  viewAs: TStore["setup"]["viewAs"];
  currentColorScheme: TColorScheme;
};

export type ApiKeyViewProps = {
  viewAs: TStore["setup"]["viewAs"];
  items: TApiKey[];
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyParams: (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => void;
  onRenameApiKey: (id: TApiKey["id"]) => void;
};

export type TableViewProps = {
  items: TApiKey[];
  viewAs?: TStore["setup"]["viewAs"];
  setViewAs?: TStore["setup"]["setViewAs"];
  userId?: TUser["id"];
  sectionWidth: number;
  currentDeviceType?: DeviceType;
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onRenameApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyParams: (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => void;
  culture?: string;
};

export type TableHeaderProps = {
  userId?: TUser["id"];
  sectionWidth: number;
  tableRef: React.Ref<HTMLDivElement>;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  setHideColumns: (value: boolean) => void;
};

export type TableRowProps = {
  item: TApiKey;
  hideColumns: boolean;
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyParams: (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => void;
  culture: string;
  onRenameApiKey: (id: TApiKey["id"]) => void;
};

export type TableHeaderColumn = {
  key: string;
  title: string;
  enable: boolean;
  default?: boolean;
  resizable: boolean;
  minWidth?: number;
};

export type CreateApiKeyDialogProps = {
  t: TTranslation;
  tReady: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  setListItems: React.Dispatch<React.SetStateAction<TApiKey[]>>;
};

export type RenameApiKeyDialogProps = {
  t: TTranslation;
  tReady: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  setListItems: React.Dispatch<React.SetStateAction<TApiKey[]>>;
  item: TApiKey;
  onChangeApiKeyParams: (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => void;
  isRequestRunning: boolean;
};

export type DeleteApiKeyDialogProps = {
  t: TTranslation;
  tReady: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  onDelete: () => void;
  isRequestRunning: boolean;
};

export type TPermissionsList = {
  [key: string]: {
    isRead: { isChecked: boolean; name: string };
    isWrite: { isChecked: boolean; name: string };
  };
};
