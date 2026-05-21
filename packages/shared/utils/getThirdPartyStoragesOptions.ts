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

import { ThirdPartyStorages } from "../enums";

import type { SelectedStorageType } from "../types";

export type ReturnOptions = {
  comboBoxOptions: {
    key: string;
    label: string;
    disabled: boolean;
    connected: boolean;
  }[];
  storagesInfo: Record<string, SelectedStorageType>;
  selectedStorageTitle: string;
  selectedStorageId: string;
};

const DefaultParameters = {
  comboBoxOptions: [],
  storagesInfo: {},
  selectedStorageTitle: "",
  selectedStorageId: "",
};

export const getOptions = (
  storageBackup?: SelectedStorageType[],
  needDefaultParameter = false,
): ReturnOptions => {
  if (!storageBackup || !Array.isArray(storageBackup)) return DefaultParameters;

  const googleStorageId = ThirdPartyStorages.GoogleId;
  const comboBoxOptions = [];
  let storagesInfo: Record<string, SelectedStorageType> = {};
  let isDefaultStorageExist = false;
  let isFirstSet = false;
  let firstSetId = "";
  let selectedStorageTitle = "";
  let selectedStorageId = "";

  for (let item = 0; item < storageBackup.length; item += 1) {
    const backupElem = storageBackup[item];
    const { isSet, properties, title, id, current } = backupElem;

    comboBoxOptions.push({
      key: id,
      label: title,
      disabled: false,
      connected: isSet,
    });

    storagesInfo = {
      ...storagesInfo,
      [id]: {
        id,
        isSet,
        title,
        properties,
      },
    };

    if (needDefaultParameter && current) {
      isDefaultStorageExist = true;
      selectedStorageId = id;
      selectedStorageTitle = title;
    }

    if (!isFirstSet && isSet) {
      isFirstSet = true;
      firstSetId = id;
    }
  }

  if (!isDefaultStorageExist && !isFirstSet) {
    selectedStorageTitle = storagesInfo?.[googleStorageId]?.title;
    selectedStorageId = storagesInfo?.[googleStorageId]?.id;
  }

  if (!isDefaultStorageExist && isFirstSet) {
    selectedStorageTitle = storagesInfo?.[firstSetId]?.title;
    selectedStorageId = storagesInfo?.[firstSetId]?.id;
  }

  return {
    comboBoxOptions,
    storagesInfo,
    selectedStorageTitle,
    selectedStorageId,
  };
};
