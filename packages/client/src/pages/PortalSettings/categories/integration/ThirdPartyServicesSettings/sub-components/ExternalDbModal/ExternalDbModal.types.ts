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

export type DatabaseType = "mysql" | "sqlite";

export type ValueType = string | number | boolean;

export type BaseConsumerProp = {
  name: string;
  title: string;
  dependsOn?: string;
  dependsOnValue?: string;
};

export interface ConsumerPropNumber extends BaseConsumerProp {
  type: "number";
  value: number;
}

export interface ConsumerPropSelect extends BaseConsumerProp {
  type: "select";
  value: string;
  options: string[];
}

export interface ConsumerPropText extends BaseConsumerProp {
  type: "text";
  value: string;
}

export interface ConsumerPropPassword extends BaseConsumerProp {
  type: "password";
  value: string;
}

export interface ConsumerPropToggle extends BaseConsumerProp {
  type: "toggle";
  value: boolean;
}

export type ConsumerProp =
  | ConsumerPropToggle
  | ConsumerPropSelect
  | ConsumerPropText
  | ConsumerPropPassword
  | ConsumerPropNumber;

export interface SelectedConsumer {
  name: string;
  title: string;
  description: string;
  instruction: string;
  canSet: boolean;
  paid: boolean;
  props: ConsumerProp[];
}

export interface ExternalDbFieldProps {
  field: ConsumerProp;
  value: ValueType;
  onChange: (name: string, value: ValueType) => void;
}

// Dynamic form data type that supports any field from consumer props
export type ExternalDbFormData = Record<string, ValueType>;

export interface SupportLinksProps {
  feedbackAndSupportUrl?: string;
  portalSettingsUrl?: string;
}

export interface ExternalDbModalProps extends SupportLinksProps {
  visible: boolean;
  onClose: VoidFunction;
  onSave: (data: Record<string, ValueType>) => Promise<void>;
  selectedConsumer: SelectedConsumer;
  isLoading?: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export interface TestConnectionResponse {
  success: boolean;
  message?: string;
}
