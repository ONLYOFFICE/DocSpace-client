// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  apiKeysLink: string;
  isUser: boolean;
  error: Error | null;
  apiKeys: TApiKey[];
  permissions: string[];
  setApiKeys: React.Dispatch<React.SetStateAction<TApiKey[]>>;
};

export type ApiKeyViewProps = {
  viewAs: TStore["setup"]["viewAs"];
  items: TApiKey[];
  onDeleteApiKey: (id: TApiKey["id"]) => void;
  onChangeApiKeyParams: (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => void;
  onEditApiKey: (id: TApiKey["id"]) => void;
  permissions: string[];
};

export type TableViewProps = {
  items: TApiKey[];
  viewAs?: TStore["setup"]["viewAs"];
  setViewAs?: TStore["setup"]["setViewAs"];
  userId?: TUser["id"];
  sectionWidth: number;
  currentDeviceType?: DeviceType;
  onDeleteApiKey: ApiKeyViewProps["onDeleteApiKey"];
  onChangeApiKeyParams: ApiKeyViewProps["onChangeApiKeyParams"];
  culture?: string;
  onEditApiKey: ApiKeyViewProps["onEditApiKey"];
  permissions: string[];
};

export type TableHeaderProps = {
  userId?: TUser["id"];
  sectionWidth: number;
  tableRef: { current: HTMLDivElement | null };
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  setHideColumns: (value: boolean) => void;
};

export type TableRowProps = {
  item: TApiKey;
  hideColumns: boolean;
  onDeleteApiKey: ApiKeyViewProps["onDeleteApiKey"];
  onChangeApiKeyParams: ApiKeyViewProps["onChangeApiKeyParams"];
  culture?: string;
  onEditApiKey: ApiKeyViewProps["onEditApiKey"];
  permissions: string[];
};

export type RowItemType = {
  item: TApiKey;
  culture?: string;
  sectionWidth: number;
  onChangeApiKeyParams: ApiKeyViewProps["onChangeApiKeyParams"];
  onDeleteApiKey: ApiKeyViewProps["onDeleteApiKey"];
  onEditApiKey: ApiKeyViewProps["onEditApiKey"];
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
  actionItem?: TApiKey | null;
  permissions: string[];
  setActionItem: React.Dispatch<React.SetStateAction<TApiKey | null>>;
  onChangeApiKeyParams: ApiKeyViewProps["onChangeApiKeyParams"];
  isRequestRunning: boolean;
  isUser: boolean;
};

export type DeleteApiKeyDialogProps = {
  t: TTranslation;
  tReady: boolean;
  isVisible: boolean;
  onClose: () => void;
  onDelete: () => void;
  isRequestRunning: boolean;
};

export type TPermissionsList = {
  [key: string]: {
    isRead: { isChecked: boolean; name: string; isDisabled?: boolean };
    isWrite: { isChecked: boolean; name: string; isDisabled?: boolean };
  };
};
