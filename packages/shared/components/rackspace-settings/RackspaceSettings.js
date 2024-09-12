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

import React from "react";
import { TextInput } from "@docspace/shared/components/text-input";
import { inject, observer } from "mobx-react";

const region = "region";
const public_container = "public_container";
const private_container = "private_container";
const filePath = "filePath";
class RackspaceSettings extends React.Component {
  static formNames = () => {
    return { region: "", public_container: "", private_container: "" };
  };

  constructor(props) {
    super(props);
    const {
      selectedStorage,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      isNeedFilePath,
    } = this.props;

    setIsThirdStorageChanged(false);
    const filePathField = isNeedFilePath ? [filePath] : [];
    setRequiredFormSettings([
      region,
      public_container,
      private_container,
      ...filePathField,
    ]);

    this.isDisabled = selectedStorage && !selectedStorage.isSet;

    this.privatePlaceholder =
      selectedStorage && selectedStorage.properties[0].title;
    this.publicPlaceholder =
      selectedStorage && selectedStorage.properties[1].title;
    this.regionPlaceholder =
      selectedStorage && selectedStorage.properties[2].title;
  }
  onChangeText = (event) => {
    const { addValueInFormSettings } = this.props;

    const { target } = event;
    const value = target.value;
    const name = target.name;

    addValueInFormSettings(name, value);
  };

  render() {
    const {
      formSettings,
      errorsFieldsBeforeSafe: isError,
      isLoadingData,
      isLoading,
      t,
      isNeedFilePath,
    } = this.props;

    return (
      <>
        <TextInput
          id="private-container-input"
          name={private_container}
          className="backup_text-input"
          scale
          value={formSettings[private_container]}
          hasError={isError[private_container]}
          onChange={this.onChangeText}
          isDisabled={isLoadingData || isLoading || this.isDisabled}
          placeholder={this.privatePlaceholder || ""}
          tabIndex={1}
        />
        <TextInput
          id="public-container-input"
          name={public_container}
          className="backup_text-input"
          scale
          value={formSettings[public_container]}
          hasError={isError[public_container]}
          onChange={this.onChangeText}
          isDisabled={isLoadingData || isLoading || this.isDisabled}
          placeholder={this.publicPlaceholder || ""}
          tabIndex={2}
        />
        <TextInput
          id="region-input"
          name={region}
          className="backup_text-input"
          scale
          value={formSettings[region]}
          hasError={isError[region]}
          onChange={this.onChangeText}
          isDisabled={isLoadingData || isLoading || this.isDisabled}
          placeholder={this.regionPlaceholder || ""}
          tabIndex={3}
        />
        {isNeedFilePath && (
          <TextInput
            id="file-path-input"
            name={filePath}
            className="backup_text-input"
            scale
            value={formSettings[filePath]}
            onChange={this.onChangeText}
            isDisabled={isLoadingData || isLoading || this.isDisabled}
            placeholder={t("Path")}
            tabIndex={4}
            hasError={isError[filePath]}
          />
        )}
      </>
    );
  }
}

export default inject(({ backup }) => {
  const {
    setFormSettings,
    setRequiredFormSettings,
    formSettings,
    errorsFieldsBeforeSafe,
    setIsThirdStorageChanged,
    addValueInFormSettings,
  } = backup;

  return {
    setFormSettings,
    setRequiredFormSettings,
    formSettings,
    errorsFieldsBeforeSafe,
    setIsThirdStorageChanged,
    addValueInFormSettings,
  };
})(observer(RackspaceSettings));
