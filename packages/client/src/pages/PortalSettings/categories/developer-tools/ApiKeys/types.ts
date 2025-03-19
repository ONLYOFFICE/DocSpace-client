import React from "react";
import { TUser } from "@docspace/shared/api/people/types";
import { TApiKey } from "@docspace/shared/api/api-keys/types";
import { DeviceType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

export type ApiKeysProps = {
  t: TTranslation;
  viewAs: TStore["setup"]["viewAs"];
};

export type ApiKeyViewProps = {
  viewAs: TStore["setup"]["viewAs"];
  items: TApiKey[];
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyStatus: (id: TApiKey["id"]) => void;
};

export type TableViewProps = {
  items: TApiKey[];
  viewAs?: TStore["setup"]["viewAs"];
  setViewAs?: TStore["setup"]["setViewAs"];
  userId?: TUser["id"];
  sectionWidth: number;
  currentDeviceType?: DeviceType;
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyStatus: (id: TApiKey["id"]) => void;
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
  onChangeApiKeyStatus: (id: TApiKey["id"]) => void;
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
  onCreateKey: ({ name }: { name: string }) => void;
  isRequestRunning: boolean;
};
