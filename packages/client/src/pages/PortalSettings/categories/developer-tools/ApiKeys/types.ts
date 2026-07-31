/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { TUser } from "@docspace/shared/api/people/types";
import {
  TApiKey,
  TApiKeyParamsRequest,
} from "@docspace/shared/api/api-keys/types";
import { DeviceType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";

export type ApiKeysProps = {
  t: TTranslation;
  viewAs: TStore["setup"]["viewAs"];
  currentColorScheme: TColorScheme;
  apiKeysUrl: string;
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
