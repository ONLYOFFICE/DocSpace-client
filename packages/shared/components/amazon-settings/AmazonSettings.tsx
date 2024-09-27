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
import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Trans } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { HelpButton } from "@docspace/shared/components/help-button";
import { RadioButton } from "@docspace/shared/components/radio-button";

import { StyledBody } from "./AmazonSettings.styled";
import {
  bucket,
  CUSTOMER_MANAGER,
  filePath,
  FORCEPATH_STYLE,
  MANAGED_KEYS,
  NONE_VALUE,
  REGION,
  SERVICE_URL,
  SSE,
  SSE_CLIENT_SIDE,
  SSE_KEY,
  SSE_KMS,
  SSE_S3,
  USE_HTTP,
} from "./AmazonSettings.constants";
import { AmazonSettingsProps } from "./AmazonSettings.types";

const AmazonSettings = ({
  selectedStorage,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
  storageRegions,
  defaultRegion,
  addValueInFormSettings,
  deleteValueFormSetting,
  errorsFieldsBeforeSafe: isError,
  isLoadingData,
  isLoading,
  formSettings,
  t,
  isNeedFilePath,
}: AmazonSettingsProps) => {
  const isDisabled = selectedStorage && !selectedStorage.isSet;
  const bucketPlaceholder =
    selectedStorage && selectedStorage.properties[0]?.title;
  const forcePathStylePlaceholder = t("ForcePathStyle");
  const regionPlaceholder =
    selectedStorage && selectedStorage.properties[2]?.title;

  const serviceUrlPlaceholder = t("ServiceUrl");
  const SSEPlaceholder = t("ServerSideEncryptionMethod");
  const useHttpPlaceholder = t("UseHttp");
  const serverSideEncryption = t("AmazonSSE");
  const clientSideEncryption = t("AmazonCSE");

  const sseKms = "SSE-KMS";
  const sseS3 = "SSE-S3";

  const availableEncryptions = [
    {
      key: "0",
      label: NONE_VALUE,
    },
    {
      key: "1",
      label: serverSideEncryption,
    },
    {
      key: "2",
      label: clientSideEncryption,
    },
  ];

  const defaultRegionValue = useRef<{
    key: string;
    label: string;
    systemName: string;
  }>();

  const regions = useMemo(() => {
    const tempRegions = [];
    for (let index = 0; index < storageRegions.length; index += 1) {
      const item = storageRegions[index];

      tempRegions.push({
        key: index.toString(),
        label: `${item.displayName} (${item.systemName})`,
        systemName: item.systemName,
      });

      if (defaultRegion === item.systemName) {
        defaultRegionValue.current = tempRegions[index];
      }
    }
    return tempRegions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [region, setRegion] = useState(() =>
    defaultRegionValue.current ? defaultRegionValue.current : regions[0],
  );

  useEffect(() => {
    const filePathField = isNeedFilePath ? [filePath] : [];
    setRequiredFormSettings([bucket, ...filePathField]);
    setIsThirdStorageChanged(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-syntax
    for (const value of regions) {
      if (value.systemName === formSettings[REGION]) {
        return setRegion(value);
      }
    }
  }, [formSettings, regions]);

  const onSelectEncryptionMethod = (options: TOption) => {
    const label = options.label;

    if (label === NONE_VALUE) {
      deleteValueFormSetting(SSE_KEY);
      deleteValueFormSetting(SSE);
    } else {
      const isServerSSE = label === serverSideEncryption;
      const value = isServerSSE ? SSE_S3 : SSE_CLIENT_SIDE;
      addValueInFormSettings(SSE, value);

      if (!isServerSSE) {
        addValueInFormSettings(SSE_KEY, "");
      } else {
        deleteValueFormSetting(SSE_KEY);
      }
    }
    setIsThirdStorageChanged(true);
  };

  const onSelectEncryptionMode = (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.currentTarget.name;

    if (value === SSE_S3) {
      deleteValueFormSetting(SSE_KEY);
    }
    addValueInFormSettings(SSE, value);
    setIsThirdStorageChanged(true);
  };

  const onSelectManagedKeys = (options: TOption) => {
    const label = options.label;

    if (label === CUSTOMER_MANAGER) {
      addValueInFormSettings(SSE_KEY, "");
    } else {
      deleteValueFormSetting(SSE_KEY);
    }

    setIsThirdStorageChanged(true);
  };
  const onSelectRegion = (options: TOption) => {
    const systemName = options.systemName;

    if (!systemName) return;

    addValueInFormSettings(REGION, systemName);
    setIsThirdStorageChanged(true);
  };

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const name = target.name;

    setIsThirdStorageChanged(true);

    addValueInFormSettings(name, value);
  };

  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.checked;
    const name = target.name;

    setIsThirdStorageChanged(true);
    addValueInFormSettings(name, value.toString());
  };

  const renderTooltip = (helpInfo: string, className?: string) => {
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
    formSettings[SSE] === SSE_KMS || formSettings[SSE] === SSE_S3
      ? availableEncryptions[1].label
      : Object.prototype.hasOwnProperty.call(formSettings, SSE)
        ? availableEncryptions[2].label
        : availableEncryptions[0].label;

  const managedKeys =
    formSettings[SSE] === SSE_KMS
      ? Object.prototype.hasOwnProperty.call(formSettings, SSE_KEY)
        ? MANAGED_KEYS[1]
        : MANAGED_KEYS[0]
      : MANAGED_KEYS[0];

  return (
    <>
      <StyledBody>
        <div className="backup_storage-tooltip">
          <Text isBold>{bucketPlaceholder}</Text>
          {renderTooltip(t("AmazonBucketTip"), "bucket-tooltip")}
        </div>
        <TextInput
          id="bucket-input"
          name={bucket}
          className="backup_text-input"
          scale
          value={formSettings[bucket]}
          hasError={isError[bucket]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          tabIndex={1}
          type={InputType.text}
          size={InputSize.base}
        />
      </StyledBody>
      <StyledBody>
        <div className="backup_storage-tooltip">
          <Text isBold>{regionPlaceholder}</Text>
          {renderTooltip(t("AmazonRegionTip"), "region-tooltip")}
        </div>
        <ComboBox
          className="region-combo-box backup_text-input"
          options={regions}
          selectedOption={{
            key: 0,
            label: region.label,
          }}
          onSelect={onSelectRegion}
          noBorder={false}
          scaled
          scaledOptions
          dropDownMaxHeight={300}
          isDisabled={isDisabled}
          tabIndex={2}
          showDisabledItems
        />
      </StyledBody>

      <StyledBody>
        <div className="backup_storage-tooltip">
          <Text isBold>{serviceUrlPlaceholder}</Text>
          {renderTooltip(t("AmazonServiceTip"), "service-tooltip")}
        </div>
        <TextInput
          id="service-url-input"
          name={SERVICE_URL}
          className="backup_text-input"
          scale
          value={formSettings[SERVICE_URL]}
          hasError={isError[SERVICE_URL]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          tabIndex={3}
          type={InputType.text}
          size={InputSize.base}
        />
      </StyledBody>

      <StyledBody>
        <Checkbox
          id="force-path-style"
          name={FORCEPATH_STYLE}
          label={forcePathStylePlaceholder}
          isChecked={formSettings[FORCEPATH_STYLE] !== "false"}
          isIndeterminate={false}
          isDisabled={isDisabled}
          onChange={onChangeCheckbox}
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
      <StyledBody>
        <Checkbox
          id="use-http"
          className="backup_checkbox"
          name={USE_HTTP}
          label={useHttpPlaceholder}
          isChecked={formSettings[USE_HTTP] !== "false"}
          isIndeterminate={false}
          isDisabled={isDisabled}
          onChange={onChangeCheckbox}
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
          <Text isBold>{SSEPlaceholder}</Text>
          {renderTooltip(t("AmazonSSETip"), "sse-method-tooltip")}
        </div>
        <ComboBox
          className="sse-method-combo-box backup_text-input"
          options={availableEncryptions}
          selectedOption={{
            key: 0,
            label: selectedEncryption,
          }}
          onSelect={onSelectEncryptionMethod}
          noBorder={false}
          scaled
          scaledOptions
          dropDownMaxHeight={300}
          isDisabled={isDisabled}
          tabIndex={7}
          showDisabledItems
        />
      </StyledBody>

      {selectedEncryption === serverSideEncryption && (
        <>
          <RadioButton
            id="sse-s3"
            className="backup_radio-button-settings"
            value=""
            label={sseS3}
            isChecked={formSettings[SSE] === SSE_S3}
            onClick={onSelectEncryptionMode}
            name={SSE_S3}
            isDisabled={isDisabled}
          />

          <RadioButton
            id="sse-kms"
            className="backup_radio-button-settings"
            value=""
            label={sseKms}
            isChecked={formSettings[SSE] === SSE_KMS}
            onClick={onSelectEncryptionMode}
            name={SSE_KMS}
            isDisabled={isDisabled}
          />

          {formSettings[SSE] === sseKms && (
            <>
              <Text isBold>Managed CMK</Text>
              <ComboBox
                className="managed-cmk-combo-box backup_text-input"
                options={MANAGED_KEYS}
                selectedOption={{
                  key: 0,
                  label: managedKeys.label,
                }}
                onSelect={onSelectManagedKeys}
                noBorder={false}
                scaled
                scaledOptions
                dropDownMaxHeight={300}
                isDisabled={isDisabled}
                tabIndex={8}
                showDisabledItems
              />

              {managedKeys.label === CUSTOMER_MANAGER && (
                <>
                  <Text isBold>KMS Key Id:</Text>
                  <TextInput
                    id="customer-manager-kms-key-id"
                    name={SSE_KEY}
                    className="backup_text-input"
                    scale
                    value={formSettings[SSE_KEY]}
                    hasError={isError[SSE_KEY]}
                    onChange={onChangeText}
                    isDisabled={isLoadingData || isLoading || isDisabled}
                    tabIndex={9}
                    type={InputType.text}
                    size={InputSize.base}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      {selectedEncryption === clientSideEncryption && (
        <>
          <Text isBold>KMS Key Id:</Text>
          <TextInput
            id="client-side-encryption-kms-key-id"
            name={SSE_KEY}
            className="backup_text-input"
            scale
            value={formSettings[SSE_KEY]}
            hasError={isError[SSE_KEY]}
            onChange={onChangeText}
            isDisabled={isLoadingData || isLoading || isDisabled}
            tabIndex={8}
            type={InputType.text}
            size={InputSize.base}
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
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          placeholder={t("Path")}
          hasError={isError[filePath]}
          type={InputType.text}
          size={InputSize.base}
        />
      )}
    </>
  );
};

export default AmazonSettings;

// export default inject(({ settingsStore, backup }) => {
//   const {
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,

//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//     deleteValueFormSetting,
//     storageRegions,
//     requiredFormSettings,
//     defaultFormSettings,
//   } = backup;
//   const defaultRegion = defaultFormSettings.region;
//   const { theme } = settingsStore;
//   return {
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,
//     storageRegions,
//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//     deleteValueFormSetting,
//     defaultRegion,
//     requiredFormSettings,
//     theme,
//   };
// })(observer(AmazonSettings));
