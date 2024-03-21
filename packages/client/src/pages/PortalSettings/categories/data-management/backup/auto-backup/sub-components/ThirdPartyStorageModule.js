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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ComboBox } from "@docspace/shared/components/combobox";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import GoogleCloudStorage from "./storages/GoogleCloudStorage";
import RackspaceStorage from "./storages/RackspaceStorage";
import SelectelStorage from "./storages/SelectelStorage";
import AmazonStorage from "./storages/AmazonStorage";
import { StyledAutoBackup } from "../../StyledBackup";
import { getOptions } from "../../common-container/GetThirdPartyStoragesOptions";

class ThirdPartyStorageModule extends React.PureComponent {
  constructor(props) {
    super(props);
    const { thirdPartyStorage, defaultStorageId, setStorageId } = this.props;

    this.state = {
      availableOptions: [],
      availableStorage: {},
    };

    const { comboBoxOptions, storagesInfo, selectedStorageId } =
      getOptions(thirdPartyStorage);

    !defaultStorageId && setStorageId(selectedStorageId);

    this.state = {
      comboBoxOptions,
      storagesInfo,
    };
  }

  onSelect = (option) => {
    const selectedStorageId = option.key;
    const { storagesInfo } = this.state;
    const { setStorageId } = this.props;
    const storage = storagesInfo[selectedStorageId];

    setStorageId(storage.id);
  };

  render() {
    const { isLoadingData, selectedStorageId, ...rest } = this.props;
    const { comboBoxOptions, storagesInfo } = this.state;

    const commonProps = {
      selectedStorage: storagesInfo[selectedStorageId],
      selectedId: selectedStorageId,
      isLoadingData,
    };
    const { GoogleId, RackspaceId, SelectelId, AmazonId } = ThirdPartyStorages;

    const storageTitle = storagesInfo[selectedStorageId]?.title;

    return (
      <StyledAutoBackup>
        <div className="auto-backup_storages-module">
          <ComboBox
            options={comboBoxOptions}
            selectedOption={{
              key: 0,
              label: storageTitle,
            }}
            onSelect={this.onSelect}
            isDisabled={isLoadingData}
            noBorder={false}
            scaled
            scaledOptions
            dropDownMaxHeight={300}
            className="backup_combo"
            showDisabledItems
          />

          {selectedStorageId === GoogleId && (
            <GoogleCloudStorage {...rest} {...commonProps} />
          )}

          {selectedStorageId === RackspaceId && (
            <RackspaceStorage {...rest} {...commonProps} />
          )}

          {selectedStorageId === SelectelId && (
            <SelectelStorage {...rest} {...commonProps} />
          )}

          {selectedStorageId === AmazonId && (
            <AmazonStorage {...rest} {...commonProps} />
          )}
        </div>
      </StyledAutoBackup>
    );
  }
}

export default inject(({ backup }) => {
  const {
    thirdPartyStorage,
    setStorageId,
    selectedStorageId,
    defaultStorageId,
  } = backup;

  return {
    thirdPartyStorage,
    setStorageId,
    selectedStorageId,
    defaultStorageId,
  };
})(withTranslation("Settings")(observer(ThirdPartyStorageModule)));
