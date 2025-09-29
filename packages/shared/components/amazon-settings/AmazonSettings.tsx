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

import classNames from "classnames";
import { TFunction } from "i18next";
import { Trans } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Text } from "../text";
import { Checkbox } from "../checkbox";
import { ComboBox, TOption } from "../combobox";
import { InputSize, InputType, TextInput } from "../text-input";
import { HelpButton } from "../help-button";
import { RadioButton } from "../radio-button";
import { useDidMount } from "../../hooks/useDidMount";

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
import styles from "./AmazonSettings.module.scss";

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
  const forcePathStylePlaceholder = t("Common:ForcePathStyle");
  const regionPlaceholder =
    selectedStorage && selectedStorage.properties[2]?.title;

  const serviceUrlPlaceholder = t("Common:ServiceUrl");
  const SSEPlaceholder = t("Common:ServerSideEncryptionMethod");
  const useHttpPlaceholder = t("Common:UseHttp");
  const serverSideEncryption = t("Common:AmazonSSE");
  const clientSideEncryption = t("Common:AmazonCSE");

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
      dataTestId: "server_encryption_option",
    },
    {
      key: "2",
      label: clientSideEncryption,
      dataTestId: "client_encryption_option",
    },
  ];

  const defaultRegionValue = useRef<{
    key: string;
    label: string;
    systemName: string;
  }>(null);

  const regions = useMemo(() => {
    return storageRegions.map((storageRegion, index) => {
      const tempRegion = {
        key: index.toString(),
        label: `${storageRegion.displayName} (${storageRegion.systemName})`,
        systemName: storageRegion.systemName,
      };

      if (defaultRegion === storageRegion.systemName) {
        defaultRegionValue.current = tempRegion;
      }
      return tempRegion;
    });
  }, [defaultRegion, storageRegions]);

  const [region, setRegion] = useState(() =>
    defaultRegionValue.current ? defaultRegionValue.current : regions[0],
  );

  useDidMount(() => {
    const filePathField = isNeedFilePath ? [filePath] : [];
    setRequiredFormSettings([bucket, ...filePathField]);
    setIsThirdStorageChanged(false);
  });

  useEffect(() => {
    const regionValue = regions.find(
      (r) => r?.systemName === formSettings[REGION],
    );
    if (!regionValue) return;

    setRegion(regionValue);
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
    if (
      !("systemName" in options) ||
      !options.systemName ||
      typeof options.systemName !== "string"
    )
      return;

    const systemName = options.systemName;

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
          <Trans t={t as TFunction} i18nKey={`${helpInfo}`} ns="Common">
            {helpInfo}
          </Trans>
        }
        dataTestId="amazon_settings_help_button"
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
    <div
      className={styles.amazonSettings}
      data-testid="amazon-settings-wrapper"
    >
      <div className={styles.body} data-testid="amazon-settings-bucket">
        <div
          className={classNames(
            styles.backupStorageTooltip,
            "backup_storage-tooltip",
          )}
        >
          <Text isBold>{bucketPlaceholder}</Text>
          {renderTooltip(t("Common:AmazonBucketTip"), "bucket-tooltip")}
        </div>
        <TextInput
          id="bucket-input"
          name={bucket}
          className={classNames(styles.backupTextInput, "backup_text-input")}
          scale
          value={formSettings[bucket]}
          hasError={isError[bucket]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          tabIndex={1}
          type={InputType.text}
          size={InputSize.base}
          testId="amazon-bucket-input"
        />
      </div>
      <div className={styles.body} data-testid="amazon-settings-region">
        <div
          className={classNames(
            styles.backupStorageTooltip,
            "backup_storage-tooltip",
          )}
        >
          <Text isBold>{regionPlaceholder}</Text>
          {renderTooltip(t("Common:AmazonRegionTip"), "region-tooltip")}
        </div>
        <ComboBox
          className={classNames(
            styles.backupTextInput,
            "region-combo-box backup_text-input",
          )}
          options={regions}
          selectedOption={region}
          directionY="both"
          onSelect={onSelectRegion}
          noBorder={false}
          scaled
          scaledOptions
          isDefaultMode
          dropDownMaxHeight={300}
          isDisabled={isDisabled}
          tabIndex={2}
          showDisabledItems
          dataTestId="amazon_settings_region_combobox"
          dropDownTestId="amazon_settings_region_dropdown"
        />
      </div>

      <div className={styles.body} data-testid="amazon-settings-service-url">
        <div
          className={classNames(
            styles.backupStorageTooltip,
            "backup_storage-tooltip",
          )}
        >
          <Text isBold>{serviceUrlPlaceholder}</Text>
          {renderTooltip(t("Common:AmazonServiceTip"), "service-tooltip")}
        </div>
        <TextInput
          id="service-url-input"
          name={SERVICE_URL}
          className={classNames(styles.backupTextInput, "backup_text-input")}
          scale
          value={formSettings[SERVICE_URL]}
          hasError={isError[SERVICE_URL]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          tabIndex={3}
          type={InputType.text}
          size={InputSize.base}
          testId="amazon-service-url-input"
        />
      </div>

      <div
        className={styles.body}
        data-testid="amazon-settings-force-path-style"
      >
        <Checkbox
          id="force-path-style"
          name={FORCEPATH_STYLE}
          label={forcePathStylePlaceholder}
          isChecked={formSettings[FORCEPATH_STYLE] !== "false"}
          isIndeterminate={false}
          isDisabled={isDisabled}
          onChange={onChangeCheckbox}
          tabIndex={4}
          data-testid="amazon-force-path-style-checkbox"
          helpButton={
            <div
              className={classNames(
                styles.backupStorageTooltip,
                "backup_storage-tooltip",
              )}
            >
              {renderTooltip(
                t("Common:AmazonForcePathStyleTip"),
                "force-path-style-tooltip",
              )}
            </div>
          }
        />
      </div>
      <div className={styles.body} data-testid="amazon-settings-use-http">
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
          data-testid="amazon-use-http-checkbox"
          helpButton={
            <div
              className={classNames(
                styles.backupStorageTooltip,
                "backup_storage-tooltip",
              )}
            >
              {renderTooltip(t("Common:AmazonHTTPTip"), "http-tooltip")}
            </div>
          }
        />
      </div>
      <div className={styles.body} data-testid="amazon-settings-sse-method">
        <div
          className={classNames(
            styles.backupStorageTooltip,
            "backup_storage-tooltip",
          )}
        >
          <Text isBold>{SSEPlaceholder}</Text>
          {renderTooltip(t("Common:AmazonSSETip"), "sse-method-tooltip")}
        </div>
        <ComboBox
          className={classNames(
            styles.backupTextInput,
            "sse-method-combo-box backup_text-input",
          )}
          options={availableEncryptions}
          selectedOption={{
            key: 0,
            label: selectedEncryption,
          }}
          directionY="both"
          onSelect={onSelectEncryptionMethod}
          noBorder={false}
          scaled
          scaledOptions
          dropDownMaxHeight={300}
          isDisabled={isDisabled}
          tabIndex={7}
          showDisabledItems
          data-testid="amazon-sse-method-combobox"
        />
      </div>

      {selectedEncryption === serverSideEncryption ? (
        <>
          <RadioButton
            id="sse-s3"
            className={classNames(
              styles.backupRadioButtonSettings,
              "backup_radio-button-settings",
            )}
            value=""
            label={sseS3}
            isChecked={formSettings[SSE] === SSE_S3}
            onClick={onSelectEncryptionMode}
            name={SSE_S3}
            isDisabled={isDisabled}
            testId="amazon-sse-s3-radio"
          />

          <RadioButton
            id="sse-kms"
            className={classNames(
              styles.backupRadioButtonSettings,
              "backup_radio-button-settings",
            )}
            value=""
            label={sseKms}
            isChecked={formSettings[SSE] === SSE_KMS}
            onClick={onSelectEncryptionMode}
            name={SSE_KMS}
            isDisabled={isDisabled}
            testId="amazon-sse-kms-radio"
          />

          {formSettings[SSE] === sseKms ? (
            <>
              <Text isBold>Managed CMK</Text>
              <ComboBox
                className={classNames(
                  styles.backupTextInput,
                  "managed-cmk-combo-box backup_text-input",
                )}
                options={MANAGED_KEYS}
                selectedOption={{
                  key: 0,
                  label: managedKeys.label,
                }}
                directionY="both"
                onSelect={onSelectManagedKeys}
                noBorder={false}
                scaled
                scaledOptions
                dropDownMaxHeight={300}
                isDisabled={isDisabled}
                tabIndex={8}
                showDisabledItems
                dataTestId="amazon_managed_cmk_combobox"
              />

              {managedKeys.label === CUSTOMER_MANAGER ? (
                <>
                  <Text isBold>KMS Key Id:</Text>
                  <TextInput
                    id="customer-manager-kms-key-id"
                    name={SSE_KEY}
                    className={classNames(
                      styles.backupTextInput,
                      "backup_text-input",
                    )}
                    scale
                    value={formSettings[SSE_KEY]}
                    hasError={isError[SSE_KEY]}
                    onChange={onChangeText}
                    isDisabled={isLoadingData || isLoading || isDisabled}
                    tabIndex={9}
                    type={InputType.text}
                    size={InputSize.base}
                    testId="amazon-customer-kms-key-input"
                  />
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}

      {selectedEncryption === clientSideEncryption ? (
        <>
          <Text isBold>KMS Key Id:</Text>
          <TextInput
            id="client-side-encryption-kms-key-id"
            name={SSE_KEY}
            className={classNames(styles.backupTextInput, "backup_text-input")}
            scale
            value={formSettings[SSE_KEY]}
            hasError={isError[SSE_KEY]}
            onChange={onChangeText}
            isDisabled={isLoadingData || isLoading || isDisabled}
            tabIndex={8}
            type={InputType.text}
            size={InputSize.base}
            testId="amazon-client-side-kms-key-input"
          />
        </>
      ) : null}

      {isNeedFilePath ? (
        <TextInput
          id="file-path-input"
          name="filePath"
          className={classNames(styles.backupTextInput, "backup_text-input")}
          scale
          value={formSettings[filePath]}
          onChange={onChangeText}
          isDisabled={isLoadingData || isLoading || isDisabled}
          placeholder={t("Common:Path")}
          hasError={isError[filePath]}
          type={InputType.text}
          size={InputSize.base}
          testId="amazon-file-path-input"
        />
      ) : null}
    </div>
  );
};

export default AmazonSettings;
