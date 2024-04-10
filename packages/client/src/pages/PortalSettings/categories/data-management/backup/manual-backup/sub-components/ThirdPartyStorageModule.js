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
import { ComboBox } from "@docspace/shared/components/combobox";
import { BackupStorageType, ThirdPartyStorages } from "@docspace/shared/enums";
import GoogleCloudStorage from "./storages/GoogleCloudStorage";
import RackspaceStorage from "./storages/RackspaceStorage";
import SelectelStorage from "./storages/SelectelStorage";
import AmazonStorage from "./storages/AmazonStorage";
import { getOptions } from "../../common-container/GetThirdPartyStoragesOptions";
import { getFromLocalStorage } from "../../../../../utils";
import { StyledManualBackup } from "../../StyledBackup";

let storageTitle = "";
let storageId = "";
class ThirdPartyStorageModule extends React.PureComponent {
  constructor(props) {
    super(props);

    storageTitle = getFromLocalStorage("LocalCopyThirdPartyStorageType");
    storageId = getFromLocalStorage("LocalCopyStorage");

    this.state = {
      comboBoxOptions: [],
      storagesInfo: {},
      selectedStorageTitle: storageTitle || "",
      selectedId: storageId || "",
      isStartCopy: false,
    };

    this.isFirstSet = false;
  }
  componentDidMount() {
    const { thirdPartyStorage } = this.props;

    if (thirdPartyStorage && thirdPartyStorage.length > 0) {
      const parameters = getOptions(thirdPartyStorage);

      const {
        comboBoxOptions,
        storagesInfo,
        selectedStorageTitle,
        selectedStorageId,
      } = parameters;

      this.setState({
        comboBoxOptions,
        storagesInfo,
        selectedStorageTitle: storageTitle || selectedStorageTitle,
        selectedId: storageId || selectedStorageId,
      });
    }
  }

  onSelect = (option) => {
    const selectedStorageId = option.key;
    const { storagesInfo } = this.state;

    const selectedStorage = storagesInfo[selectedStorageId];
    this.setState({
      selectedStorageTitle: selectedStorage.title,
      selectedId: selectedStorage.id,
    });
  };

  onMakeCopyIntoStorage = async () => {
    const { selectedId, selectedStorageTitle } = this.state;
    const { onMakeCopy, isFormReady } = this.props;
    const { StorageModuleType } = BackupStorageType;

    if (!isFormReady()) return;

    this.setState({
      isStartCopy: true,
    });

    await onMakeCopy(
      null,
      "ThirdPartyStorage",
      `${StorageModuleType}`,
      selectedId,
      selectedStorageTitle,
    );

    this.setState({
      isStartCopy: false,
    });
  };

  render() {
    const { isMaxProgress, thirdPartyStorage, buttonSize } = this.props;
    const {
      comboBoxOptions,
      selectedStorageTitle,
      selectedId,
      isStartCopy,
      storagesInfo,
    } = this.state;

    const commonProps = {
      isLoadingData: !isMaxProgress || isStartCopy,
      selectedStorage: storagesInfo[selectedId],
      isMaxProgress,
      selectedId,
      buttonSize,
      onMakeCopyIntoStorage: this.onMakeCopyIntoStorage,
    };

    const { GoogleId, RackspaceId, SelectelId, AmazonId } = ThirdPartyStorages;
    return (
      <StyledManualBackup>
        <div className="manual-backup_storages-module">
          <ComboBox
            options={comboBoxOptions}
            selectedOption={{ key: 0, label: selectedStorageTitle }}
            onSelect={this.onSelect}
            isDisabled={!isMaxProgress || isStartCopy || !!!thirdPartyStorage}
            noBorder={false}
            scaled
            scaledOptions
            dropDownMaxHeight={400}
            className="backup_combo"
            showDisabledItems
          />

          {selectedId === GoogleId && <GoogleCloudStorage {...commonProps} />}

          {selectedId === RackspaceId && <RackspaceStorage {...commonProps} />}

          {selectedId === SelectelId && <SelectelStorage {...commonProps} />}

          {selectedId === AmazonId && <AmazonStorage {...commonProps} />}
        </div>
      </StyledManualBackup>
    );
  }
}

export default inject(({ backup }) => {
  const { thirdPartyStorage, isFormReady } = backup;

  return {
    thirdPartyStorage,
    isFormReady,
  };
})(observer(ThirdPartyStorageModule));
