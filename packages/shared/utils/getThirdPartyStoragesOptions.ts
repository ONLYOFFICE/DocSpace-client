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
