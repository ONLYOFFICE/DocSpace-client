// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable jsx-a11y/tabindex-no-positive */
import React from "react";

import { InputSize, InputType, TextInput } from "../text-input";
import { useDidMount } from "../../hooks/useDidMount";

import { BUCKET, FILE_PATH } from "./GoogleCloudSettings.constants";
import type { GoogleCloudSettingsProps } from "./GoogleCloudSettings.types";

const GoogleCloudSettings = ({
  t,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
  addValueInFormSettings,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe: isError,
  formSettings,
  isLoading,
  isLoadingData,
}: GoogleCloudSettingsProps) => {
  useDidMount(() => {
    const filePathField = isNeedFilePath ? [FILE_PATH] : [];
    setRequiredFormSettings([BUCKET, ...filePathField]);
    setIsThirdStorageChanged(false);
  });

  const isDisabled = selectedStorage && !selectedStorage.isSet;
  const bucketPlaceholder =
    selectedStorage && selectedStorage.properties[0].title;

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const name = target.name;

    addValueInFormSettings(name, value);
  };

  return (
    <>
      <TextInput
        scale
        tabIndex={1}
        name={BUCKET}
        id="bucket-input"
        onChange={onChangeText}
        className="backup_text-input"
        value={formSettings[BUCKET]}
        hasError={isError[BUCKET]}
        isDisabled={isLoadingData || isLoading || isDisabled}
        placeholder={bucketPlaceholder || ""}
        type={InputType.text}
        size={InputSize.base}
      />

      {isNeedFilePath ? (
        <TextInput
          scale
          tabIndex={2}
          type={InputType.text}
          size={InputSize.base}
          name={FILE_PATH}
          id="file-path-input"
          placeholder={t("Common:Path")}
          onChange={onChangeText}
          className="backup_text-input"
          hasError={isError[FILE_PATH]}
          value={formSettings[FILE_PATH]}
          isDisabled={isLoadingData || isLoading || isDisabled}
        />
      ) : null}
    </>
  );
};

export default GoogleCloudSettings;

// export default inject(({ backup }) => {
//   const {
//     setFormSettings,
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,
//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//   } = backup;

//   return {
//     setFormSettings,
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,
//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//   };
// })(observer(GoogleCloudSettings));
