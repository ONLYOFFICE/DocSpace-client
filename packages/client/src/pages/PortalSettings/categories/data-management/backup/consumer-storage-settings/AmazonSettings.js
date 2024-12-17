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

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { TextInput } from "@docspace/shared/components/text-input";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { RadioButton } from "@docspace/shared/components/radio-button";
import { Text } from "@docspace/shared/components/text";
import styled from "styled-components";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Trans } from "react-i18next";
import { hasOwnProperty } from "@docspace/shared/utils/object";

const bucket = "bucket";
const REGION = "region";
const serviceurl = "serviceurl";
const forcepathstyle = "forcepathstyle";
const usehttp = "usehttp";
const sse = "sse";
const sse_kms = "awskms";
const sse_key = "ssekey";
const sse_s3 = "aes256";
const sse_client_side = "clientawskms";

const filePath = "filePath";

const StyledBody = styled.div`
  margin-bottom: 16px;
  .backup_storage-tooltip {
    display: flex;
    align-items: center;
    p {
      margin-inline-end: 8px;
    }
  }
  svg {
    path {
      fill: ${(props) => props.theme.iconButton.color} !important;
    }
  }
`;
class AmazonSettings extends React.Component {
  static formNames = (systemName) => {
    return {
      bucket: "",
      region: systemName,
      serviceurl: "",
      forcepathstyle: "false",
      usehttp: "false",
    };
  };

  constructor(props) {
    super(props);
    const {
      t,
      selectedStorage,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      isNeedFilePath,
      storageRegions,
      defaultRegion,
    } = this.props;

    this.isDisabled = selectedStorage && !selectedStorage.isSet;

    const filePathField = isNeedFilePath ? [filePath] : [];
    setRequiredFormSettings([bucket, ...filePathField]);
    setIsThirdStorageChanged(false);

    this.bucketPlaceholder =
      selectedStorage && selectedStorage.properties[0]?.title;

    this.forcePathStylePlaceholder = t("ForcePathStyle");

    this.regionPlaceholder =
      selectedStorage && selectedStorage.properties[2]?.title;

    this.serviceUrlPlaceholder = t("ServiceUrl");
    this.SSEPlaceholder = t("ServerSideEncryptionMethod");
    this.useHttpPlaceholder = t("UseHttp");

    this.sse_kms = "SSE-KMS";
    this.sse_s3 = "SSE-S3";

    this.serverSideEncryption = t("AmazonSSE");
    this.clientSideEncryption = t("AmazonCSE");
    this.defaultManaged = "Default AWS managed CMK";
    this.customerManager = "Customer manager CMK";
    this.noneValue = "None";

    this.availableEncryptions = [
      {
        key: "0",
        label: this.noneValue,
      },
      {
        key: "1",
        label: this.serverSideEncryption,
      },
      {
        key: "2",
        label: this.clientSideEncryption,
      },
    ];

    this.managedKeys = [
      {
        key: "0",
        label: this.defaultManaged,
      },
      {
        key: "1",
        label: this.customerManager,
      },
    ];

    this.regions = [];
    let defaultRegionValue;

    for (let index = 0; index < storageRegions.length; ++index) {
      const item = storageRegions[index];

      this.regions.push({
        key: index.toString(),
        label: `${item.displayName} (${item.systemName})`,
        systemName: item.systemName,
      });

      if (defaultRegion === item.systemName) {
        defaultRegionValue = this.regions[index];
      }
    }

    this.state = {
      region: defaultRegionValue || this.regions[0],
    };
  }

  componentDidUpdate(prevProps) {
    const { formSettings } = this.props;

    if (formSettings[REGION] !== prevProps.formSettings[REGION]) {
      const selectedRegion = this.regions.find(
        (value) => value.systemName === formSettings[REGION],
      );
      if (selectedRegion) {
        this.setState({
          region: selectedRegion,
        });
      }
    }
  }

  onSelectEncryptionMethod = (options) => {
    const {
      addValueInFormSettings,
      deleteValueFormSetting,
      setIsThirdStorageChanged,
    } = this.props;

    const label = options.label;

    if (label === this.noneValue) {
      deleteValueFormSetting(sse_key);
      deleteValueFormSetting(sse);
    } else {
      const isServerSSE = label === this.serverSideEncryption;
      const value = isServerSSE ? sse_s3 : sse_client_side;
      addValueInFormSettings(sse, value);

      if (!isServerSSE) {
        addValueInFormSettings(sse_key, "");
      } else {
        deleteValueFormSetting(sse_key);
      }
    }
    setIsThirdStorageChanged(true);
  };

  onSelectEncryptionMode = (e) => {
    const {
      setIsThirdStorageChanged,
      addValueInFormSettings,
      deleteValueFormSetting,
    } = this.props;

    const value = e.target.name;

    if (value === sse_s3) {
      deleteValueFormSetting(sse_key);
    }
    addValueInFormSettings(sse, value);
    setIsThirdStorageChanged(true);
  };

  onSelectManagedKeys = (options) => {
    const {
      addValueInFormSettings,
      deleteValueFormSetting,
      setIsThirdStorageChanged,
    } = this.props;

    const label = options.label;

    if (label === this.customerManager) {
      addValueInFormSettings(sse_key, "");
    } else {
      deleteValueFormSetting(sse_key);
    }

    setIsThirdStorageChanged(true);
  };

  onSelectRegion = (options) => {
    const { addValueInFormSettings, setIsThirdStorageChanged } = this.props;

    const systemName = options.systemName;

    addValueInFormSettings(REGION, systemName);
    setIsThirdStorageChanged(true);
  };

  onChangeText = (event) => {
    const { addValueInFormSettings, setIsThirdStorageChanged } = this.props;
    const { target } = event;
    const value = target.value;
    const name = target.name;

    setIsThirdStorageChanged(true);

    addValueInFormSettings(name, value);
  };

  onChangeCheckbox = (event) => {
    const { addValueInFormSettings, setIsThirdStorageChanged } = this.props;
    const { target } = event;
    const value = target.checked;
    const name = target.name;

    setIsThirdStorageChanged(true);
    addValueInFormSettings(name, value.toString());
  };

  render() {
    const {
      errorsFieldsBeforeSafe: isError,
      isLoadingData,
      isLoading,
      formSettings,
      t,
      isNeedFilePath,
      theme,
    } = this.props;
    const { region } = this.state;

    const renderTooltip = (helpInfo, className) => {
      return (
        <HelpButton
          className={className}
          offsetRight={0}
          iconName={HelpReactSvgUrl}
          tooltipContent={
            <Trans t={t} i18nKey={`${helpInfo}`} ns="Settings">
              {helpInfo}
            </Trans>
          }
        />
      );
    };

    const selectedEncryption =
      formSettings[sse] === sse_kms || formSettings[sse] === sse_s3
        ? this.availableEncryptions[1].label
        : hasOwnProperty(formSettings, sse)
          ? this.availableEncryptions[2].label
          : this.availableEncryptions[0].label;

    const managedKeys =
      formSettings[sse] === sse_kms
        ? hasOwnProperty(formSettings, sse_key)
          ? this.managedKeys[1]
          : this.managedKeys[0]
        : this.managedKeys[0];

    return (
      <>
        <StyledBody>
          <div className="backup_storage-tooltip">
            <Text isBold>{this.bucketPlaceholder}</Text>
            {renderTooltip(t("AmazonBucketTip"), "bucket-tooltip")}
          </div>
          <TextInput
            id="bucket-input"
            name={bucket}
            className="backup_text-input"
            scale
            value={formSettings[bucket]}
            hasError={isError[bucket]}
            onChange={this.onChangeText}
            isDisabled={isLoadingData || isLoading || this.isDisabled}
            tabIndex={1}
          />
        </StyledBody>
        <StyledBody>
          <div className="backup_storage-tooltip">
            <Text isBold>{this.regionPlaceholder}</Text>
            {renderTooltip(t("AmazonRegionTip"), "region-tooltip")}
          </div>
          <ComboBox
            className="region-combo-box backup_text-input"
            options={this.regions}
            selectedOption={{
              key: 0,
              label: region.label,
            }}
            onSelect={this.onSelectRegion}
            noBorder={false}
            scaled
            scaledOptions
            dropDownMaxHeight={300}
            isDisabled={this.isDisabled}
            tabIndex={2}
            showDisabledItems
          />
        </StyledBody>

        <StyledBody>
          <div className="backup_storage-tooltip">
            <Text isBold>{this.serviceUrlPlaceholder}</Text>
            {renderTooltip(t("AmazonServiceTip"), "service-tooltip")}
          </div>
          <TextInput
            id="service-url-input"
            name={serviceurl}
            className="backup_text-input"
            scale
            value={formSettings[serviceurl]}
            hasError={isError[serviceurl]}
            onChange={this.onChangeText}
            isDisabled={isLoadingData || isLoading || this.isDisabled}
            tabIndex={3}
          />
        </StyledBody>

        <StyledBody theme={theme}>
          <Checkbox
            id="force-path-style"
            name={forcepathstyle}
            label={this.forcePathStylePlaceholder}
            isChecked={formSettings[forcepathstyle] !== "false"}
            isIndeterminate={false}
            isDisabled={this.isDisabled}
            onChange={this.onChangeCheckbox}
            tabIndex={4}
            helpButton={
              <div className="backup_storage-tooltip">
                {renderTooltip(
                  t("AmazonForcePathStyleTip"),
                  "force-path-style-tooltip",
                )}
              </div>
            }
          />
        </StyledBody>
        <StyledBody theme={theme}>
          <Checkbox
            id="use-http"
            className="backup_checkbox"
            name={usehttp}
            label={this.useHttpPlaceholder}
            isChecked={formSettings[usehttp] !== "false"}
            isIndeterminate={false}
            isDisabled={this.isDisabled}
            onChange={this.onChangeCheckbox}
            tabIndex={5}
            helpButton={
              <div className="backup_storage-tooltip">
                {renderTooltip(t("AmazonHTTPTip"), "http-tooltip")}
              </div>
            }
          />
        </StyledBody>
        <StyledBody>
          <div className="backup_storage-tooltip">
            <Text isBold>{this.SSEPlaceholder}</Text>
            {renderTooltip(t("AmazonSSETip"), "sse-method-tooltip")}
          </div>
          <ComboBox
            className="sse-method-combo-box backup_text-input"
            options={this.availableEncryptions}
            selectedOption={{
              key: 0,
              label: selectedEncryption,
            }}
            onSelect={this.onSelectEncryptionMethod}
            noBorder={false}
            scaled
            scaledOptions
            dropDownMaxHeight={300}
            isDisabled={this.isDisabled}
            tabIndex={7}
            showDisabledItems
          />
        </StyledBody>

        {selectedEncryption === this.serverSideEncryption && (
          <>
            <RadioButton
              id="sse-s3"
              className="backup_radio-button-settings"
              value=""
              label={this.sse_s3}
              isChecked={formSettings[sse] === sse_s3}
              onClick={this.onSelectEncryptionMode}
              name={sse_s3}
              isDisabled={this.isDisabled}
            />

            <RadioButton
              id="sse-kms"
              className="backup_radio-button-settings"
              value=""
              label={this.sse_kms}
              isChecked={formSettings[sse] === sse_kms}
              onClick={this.onSelectEncryptionMode}
              name={sse_kms}
              isDisabled={this.isDisabled}
            />

            {formSettings[sse] === sse_kms && (
              <>
                <Text isBold>Managed CMK</Text>
                <ComboBox
                  className="managed-cmk-combo-box backup_text-input"
                  options={this.managedKeys}
                  selectedOption={{
                    key: 0,
                    label: managedKeys.label,
                    systemName: managedKeys.systemName,
                  }}
                  onSelect={this.onSelectManagedKeys}
                  noBorder={false}
                  scaled
                  scaledOptions
                  dropDownMaxHeight={300}
                  isDisabled={this.isDisabled}
                  tabIndex={8}
                  showDisabledItems
                />

                {managedKeys.label === this.customerManager && (
                  <>
                    <Text isBold>KMS Key Id:</Text>
                    <TextInput
                      id="customer-manager-kms-key-id"
                      name={sse_key}
                      className="backup_text-input"
                      scale
                      value={formSettings[sse_key]}
                      hasError={isError[sse_key]}
                      onChange={this.onChangeText}
                      isDisabled={isLoadingData || isLoading || this.isDisabled}
                      tabIndex={9}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}

        {selectedEncryption === this.clientSideEncryption && (
          <>
            <Text isBold>KMS Key Id:</Text>
            <TextInput
              id="client-side-encryption-kms-key-id"
              name={sse_key}
              className="backup_text-input"
              scale
              value={formSettings[sse_key]}
              hasError={isError[sse_key]}
              onChange={this.onChangeText}
              isDisabled={isLoadingData || isLoading || this.isDisabled}
              tabIndex={8}
            />
          </>
        )}

        {isNeedFilePath && (
          <TextInput
            id="file-path-input"
            name="filePath"
            className="backup_text-input"
            scale
            value={formSettings[filePath]}
            onChange={this.onChangeText}
            isDisabled={isLoadingData || isLoading || this.isDisabled}
            placeholder={t("Path")}
            hasError={isError[filePath]}
          />
        )}
      </>
    );
  }
}

export default inject(({ settingsStore, backup }) => {
  const {
    setRequiredFormSettings,
    formSettings,
    errorsFieldsBeforeSafe,

    setIsThirdStorageChanged,
    addValueInFormSettings,
    deleteValueFormSetting,
    storageRegions,
    requiredFormSettings,
    defaultFormSettings,
  } = backup;
  const defaultRegion = defaultFormSettings.region;
  const { theme } = settingsStore;
  return {
    setRequiredFormSettings,
    formSettings,
    errorsFieldsBeforeSafe,
    storageRegions,
    setIsThirdStorageChanged,
    addValueInFormSettings,
    deleteValueFormSetting,
    defaultRegion,
    requiredFormSettings,
    theme,
  };
})(observer(AmazonSettings));
