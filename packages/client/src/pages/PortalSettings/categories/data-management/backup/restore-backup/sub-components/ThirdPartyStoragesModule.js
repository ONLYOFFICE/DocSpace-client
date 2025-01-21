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

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import React from "react";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";

import { ComboBox } from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Text } from "@docspace/shared/components/text";

import { ThirdPartyStorages } from "@docspace/shared/enums";

import GoogleCloudStorage from "./storages/GoogleCloudStorage";
import AmazonStorage from "./storages/AmazonStorage";
import RackspaceStorage from "./storages/RackspaceStorage";
import SelectelStorage from "./storages/SelectelStorage";
import { getOptions } from "../../common-container/GetThirdPartyStoragesOptions";
import { StyledComboBoxItem } from "../../StyledBackup";

class ThirdPartyStoragesModule extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      comboBoxOptions: [],
      storagesInfo: {},

      selectedStorageTitle: "",
      selectedStorageId: "",
    };
  }

  componentDidMount() {
    const { onSetStorageId, thirdPartyStorage } = this.props;
    if (thirdPartyStorage) {
      const parameters = getOptions(thirdPartyStorage);

      const {
        comboBoxOptions,
        storagesInfo,
        selectedStorageTitle,
        selectedStorageId,
      } = parameters;

      onSetStorageId && onSetStorageId(selectedStorageId);

      this.setState({
        comboBoxOptions,
        storagesInfo,

        selectedStorageTitle,
        selectedStorageId,
      });
    }
  }

  onSelect = (event) => {
    const data = event.target.dataset;

    const selectedStorageId = data.thirdPartyKey;
    const { storagesInfo } = this.state;
    const { onSetStorageId } = this.props;
    const storage = storagesInfo[selectedStorageId];
    const selectedStorage = storagesInfo[selectedStorageId];

    if (!selectedStorage.isSet) {
      return window.open(
        `/portal-settings/integration/third-party-services?service=${data.thirdPartyKey}`,
        "_blank",
      );
    }

    onSetStorageId && onSetStorageId(storage.id);

    this.setState({
      selectedStorageTitle: storage.title,
      selectedStorageId: storage.id,
    });
  };

  render() {
    const {
      comboBoxOptions,
      selectedStorageTitle,
      selectedStorageId,
      storagesInfo,
    } = this.state;
    const { thirdPartyStorage } = this.props;

    const commonProps = {
      selectedStorage: storagesInfo[selectedStorageId],
    };

    const { GoogleId, RackspaceId, SelectelId, AmazonId } = ThirdPartyStorages;

    const advancedOptions = comboBoxOptions?.map((item) => {
      return (
        <StyledComboBoxItem isDisabled={item.disabled} key={item.key}>
          <DropDownItem
            onClick={this.onSelect}
            className={item.className}
            data-third-party-key={item.key}
            disabled={item.disabled}
          >
            <Text className="drop-down-item_text" fontWeight={600}>
              {item.label}
            </Text>

            {!item.disabled && !item.connected ? (
              <ReactSVG
                src={ExternalLinkReactSvgUrl}
                className="drop-down-item_icon"
              />
            ) : null}
          </DropDownItem>
        </StyledComboBoxItem>
      );
    });

    return (
      <>
        <ComboBox
          options={[]}
          advancedOptions={advancedOptions}
          selectedOption={{ key: 0, label: selectedStorageTitle }}
          onSelect={this.onSelect}
          isDisabled={!thirdPartyStorage}
          size="content"
          manualWidth="400px"
          directionY="both"
          displaySelectedOption
          noBorder={false}
          isDefaultMode
          hideMobileView={false}
          forceCloseClickOutside
          scaledOptions
          showDisabledItems
          displayArrow
          className="backup_combo"
        />

        {selectedStorageId === GoogleId ? (
          <GoogleCloudStorage {...commonProps} {...this.props} />
        ) : null}
        {selectedStorageId === RackspaceId ? (
          <RackspaceStorage {...commonProps} {...this.props} />
        ) : null}
        {selectedStorageId === SelectelId ? (
          <SelectelStorage {...commonProps} {...this.props} />
        ) : null}
        {selectedStorageId === AmazonId ? (
          <AmazonStorage {...commonProps} {...this.props} />
        ) : null}
      </>
    );
  }
}
export default inject(({ backup }) => {
  const { thirdPartyStorage } = backup;
  return {
    thirdPartyStorage,
  };
})(observer(ThirdPartyStoragesModule));
