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
import { RackspaceSettingsProps } from "./RackspaceSettings.types";
import {
  FILE_PATH,
  PRIVATE_CONTAINER,
  PUBLIC_CONTAINER,
  REGION,
} from "./RackspaceSettings.constants";

const RackspaceSettings = ({
  isLoading,
  formSettings,
  isLoadingData,
  selectedStorage,
  isNeedFilePath,
  errorsFieldsBeforeSafe: isError,
  t,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
  addValueInFormSettings,
}: RackspaceSettingsProps) => {
  const isDisabled = selectedStorage && !selectedStorage.isSet;
  const privatePlaceholder =
    selectedStorage && selectedStorage.properties[0].title;
  const publicPlaceholder =
    selectedStorage && selectedStorage.properties[1].title;
  const regionPlaceholder =
    selectedStorage && selectedStorage.properties[2].title;

  useDidMount(() => {
    setIsThirdStorageChanged(false);
    const filePathField = isNeedFilePath ? [FILE_PATH] : [];
    setRequiredFormSettings([
      REGION,
      PUBLIC_CONTAINER,
      PRIVATE_CONTAINER,
      ...filePathField,
    ]);
  });

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const name = target.name;

    addValueInFormSettings(name, value);
  };

  return (
    <>
      <TextInput
        id="private-container-input"
        name={PRIVATE_CONTAINER}
        className="backup_text-input"
        scale
        value={formSettings[PRIVATE_CONTAINER]}
        hasError={isError[PRIVATE_CONTAINER]}
        onChange={onChangeText}
        isDisabled={isLoadingData || isLoading || isDisabled}
        placeholder={privatePlaceholder || ""}
        tabIndex={1}
        type={InputType.text}
        size={InputSize.base}
        testId="rackspace_private_container_input"
      />
      <TextInput
        id="public-container-input"
        name={PUBLIC_CONTAINER}
        className="backup_text-input"
        scale
        value={formSettings[PUBLIC_CONTAINER]}
        hasError={isError[PUBLIC_CONTAINER]}
        onChange={onChangeText}
        isDisabled={isLoadingData || isLoading || isDisabled}
        placeholder={publicPlaceholder || ""}
        tabIndex={2}
        type={InputType.text}
        size={InputSize.base}
        testId="rackspace_public_container_input"
      />
      <TextInput
        id="region-input"
        name={REGION}
        className="backup_text-input"
        scale
        value={formSettings[REGION]}
        hasError={isError[REGION]}
        onChange={onChangeText}
        isDisabled={isLoadingData || isLoading || isDisabled}
        placeholder={regionPlaceholder || ""}
        tabIndex={3}
        type={InputType.text}
        size={InputSize.base}
        testId="rackspace_region_input"
      />
      {isNeedFilePath ? (
        <TextInput
          id="file-path-input"
          name={FILE_PATH}
          className="backup_text-input"
          scale
          value={formSettings[FILE_PATH]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          placeholder={t("Common:Path")}
          tabIndex={4}
          hasError={isError[FILE_PATH]}
          type={InputType.text}
          size={InputSize.base}
          testId="rackspace_file_path_input"
        />
      ) : null}
    </>
  );
};

export default RackspaceSettings;

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
// })(observer(RackspaceSettings));
