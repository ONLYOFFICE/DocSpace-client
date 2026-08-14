/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { Label } from "@docspace/ui-kit/components/label";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { toastr } from "@docspace/ui-kit/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { SettingsDSConnectSkeleton } from "@docspace/shared/skeletons/settings";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import * as Styled from "./index.styled";
import styles from "./index.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";
import ApplyToPortalDialog from "../../developer-tools/DocsConnect/TenantPanel/sub-components/ApplyToPortalDialog";

const URL_REGEX =
  /^(?:https?:\/\/(?:[^\/]+\/)?|^\/)[-a-zA-Z0-9@:%._\+~#=]{1,256}\/?$/;
const DNS_PLACEHOLDER = `${window.location.protocol}//<docspace-dns-name>/`;
const EDITOR_URL_PLACEHOLDER = `${window.location.protocol}//<editors-dns-name>/`;
const SECRET_KEY_MASK_CHAR = "•";
const SECRET_KEY_MASK = SECRET_KEY_MASK_CHAR.repeat(16);

const DocumentService = ({
  changeDocumentServiceLocation,
  currentColorScheme,
  documentServiceSettingsUrl,
  initialDocumentServiceData,
  showPortalSettingsLoader,
  apiBasicLink,
  docsConnectConnection,
  fetchDocsConnectConnection,
  applyDocsConnectToPortal,
  isDocsConnectAvailable,
}) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [isSaveLoading, setSaveIsLoading] = useState(false);
  const [isResetLoading, setResetIsLoading] = useState(false);
  const [connectDialogVisible, setConnectDialogVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [docServiceUrl, setDocServiceUrl] = useState("");
  const [docServiceUrlIsValid, setDocServiceUrlIsValid] = useState(true);

  const [isDisabledCertificat, setIsDisabledCertificat] = useState(false);

  const [secretKey, setSecretKey] = useState(SECRET_KEY_MASK);
  const [authHeader, setAuthHeader] = useState("");

  const [portalUrl, setPortalUrl] = useState("");
  const [portalUrlIsValid, setPortalUrlIsValid] = useState(true);
  const [internalUrl, setInternalUrl] = useState("");
  const [internalUrlIsValid, setInternalUrlIsValid] = useState(true);

  const [isDefaultSettings, setIsDefaultSettings] = useState(false);
  const [isShowAdvancedSettings, setIsShowAdvancedSettings] = useState(false);

  const [initPortalUrl, setInitPortalUrl] = useState("");
  const [initSecretKey, setInitSecretKey] = useState(SECRET_KEY_MASK);
  const [initAuthHeader, setInitAuthHeader] = useState("");
  const [initDocServiceUrl, setInitDocServiceUrl] = useState("");
  const [initInternalUrl, setInitInternalUrl] = useState("");
  const [initIsDisabledCertificat, setInitIsDisabledCertificat] =
    useState(false);

  useEffect(() => {
    setDocumentTitle(t("DocumentService"));
  }, [t]);

  useEffect(() => {
    if (isDocsConnectAvailable) fetchDocsConnectConnection?.();
  }, [fetchDocsConnectConnection, isDocsConnectAvailable]);

  const applySecretKey = (value) => {
    const nextValue = value || SECRET_KEY_MASK;
    setSecretKey(nextValue);
    setInitSecretKey(nextValue);
  };

  useEffect(() => {
    if (initialDocumentServiceData) {
      const result = initialDocumentServiceData;
      setIsDefaultSettings(result?.isDefault || false);
      setPortalUrl(result?.docServicePortalUrl);
      applySecretKey(result?.docServiceSignatureSecret);
      setAuthHeader(result?.docServiceSignatureHeader);
      setInternalUrl(result?.docServiceUrlInternal);
      setDocServiceUrl(result?.docServiceUrl);
      setIsDisabledCertificat(!result?.docServiceSslVerification || false);

      setInitPortalUrl(result?.docServicePortalUrl);
      setInitAuthHeader(result?.docServiceSignatureHeader);
      setInitDocServiceUrl(result?.docServiceUrl);
      setInitInternalUrl(result?.docServiceUrlInternal);
      setInitIsDisabledCertificat(!result?.docServiceSslVerification || false);
    }
  }, [initialDocumentServiceData]);

  const isSecretKeyMasked = secretKey === SECRET_KEY_MASK;
  const secretKeyToSave = isSecretKeyMasked ? undefined : secretKey;

  const onChangeDocServiceUrl = (e) => {
    setDocServiceUrl(e.target.value);
    if (!e.target.value) setDocServiceUrlIsValid(true);
    else setDocServiceUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const onChangeIsDisabledCertificat = () => {
    setIsDisabledCertificat((prevState) => !prevState);
  };

  const onChangeAuthHeader = (e) => {
    setAuthHeader(e.target.value);
  };

  const onChangeSecretKey = (e) => {
    const { value } = e.target;

    if (isSecretKeyMasked) {
      setSecretKey(value.split(SECRET_KEY_MASK_CHAR).join(""));
      return;
    }

    setSecretKey(value);
  };

  const onChangeIsShowAdvancedSettings = () => {
    setIsShowAdvancedSettings((prevState) => !prevState);
  };

  const onChangeInternalUrl = (e) => {
    setInternalUrl(e.target.value);
    if (!e.target.value) setInternalUrlIsValid(true);
    else setInternalUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const onChangePortalUrl = (e) => {
    setPortalUrl(e.target.value);
    if (!e.target.value) setPortalUrlIsValid(true);
    else setPortalUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSaveIsLoading(true);

    changeDocumentServiceLocation(
      docServiceUrl,
      secretKeyToSave,
      authHeader ?? initAuthHeader,
      internalUrl,
      portalUrl,
      !isDisabledCertificat,
    )
      .then((result) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));

        setIsDefaultSettings(result?.isDefault || false);
        setPortalUrl(result?.docServicePortalUrl);
        setAuthHeader(result?.docServiceSignatureHeader);
        applySecretKey(result?.docServiceSignatureSecret);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);
        setIsDisabledCertificat(!result?.docServiceSslVerification || false);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitAuthHeader(result?.docServiceSignatureHeader);
        setInitDocServiceUrl(result?.docServiceUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitIsDisabledCertificat(
          !result?.docServiceSslVerification || false,
        );
      })
      .catch((err) => toastr.error(err))
      .finally(() => setSaveIsLoading(false));
  };

  const onReset = () => {
    setDocServiceUrlIsValid(true);
    setInternalUrlIsValid(true);
    setPortalUrlIsValid(true);

    setResetIsLoading(true);
    changeDocumentServiceLocation(null, null, null, null, null, true)
      .then((result) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));

        setIsDefaultSettings(result?.isDefault || false);
        setPortalUrl(result?.docServicePortalUrl);
        setAuthHeader(result?.docServiceSignatureHeader);
        applySecretKey(result?.docServiceSignatureSecret);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);
        setIsDisabledCertificat(!result?.docServiceSslVerification || false);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitAuthHeader(result?.docServiceSignatureHeader);
        setInitDocServiceUrl(result?.docServiceUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitIsDisabledCertificat(
          !result?.docServiceSslVerification || false,
        );

        setIsShowAdvancedSettings(false);
      })
      .catch((e) => toastr.error(e))
      .finally(() => setResetIsLoading(false));
  };

  const onConnectDocsConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await applyDocsConnectToPortal();

      setIsDefaultSettings(result?.isDefault || false);
      setPortalUrl(result?.docServicePortalUrl);
      setAuthHeader(result?.docServiceSignatureHeader);
      applySecretKey(
        result?.docServiceSignatureSecret ?? docsConnectConnection?.secret,
      );
      setInternalUrl(result?.docServiceUrlInternal);
      setDocServiceUrl(result?.docServiceUrl);
      setIsDisabledCertificat(!result?.docServiceSslVerification || false);

      setInitPortalUrl(result?.docServicePortalUrl);
      setInitAuthHeader(result?.docServiceSignatureHeader);
      setInitDocServiceUrl(result?.docServiceUrl);
      setInitInternalUrl(result?.docServiceUrlInternal);
      setInitIsDisabledCertificat(!result?.docServiceSslVerification || false);

      toastr.success(t("Common:ChangesSavedSuccessfully"));
      setConnectDialogVisible(false);
    } catch (e) {
      toastr.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const normalizeAddress = (value) =>
    (value ?? "")
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "")
      .toLowerCase();

  const isConnectedToDocsConnect =
    !!docsConnectConnection?.address &&
    !!docServiceUrl &&
    normalizeAddress(docServiceUrl) ===
      normalizeAddress(docsConnectConnection.address);

  const showConnectEditorsBanner =
    !!docsConnectConnection && !isConnectedToDocsConnect;

  const isFormEmpty =
    !docServiceUrl &&
    !internalUrl &&
    !portalUrl &&
    !authHeader &&
    !secretKeyToSave;
  const allInputsValid =
    docServiceUrlIsValid && internalUrlIsValid && portalUrlIsValid;

  const isValuesInit =
    docServiceUrl == initDocServiceUrl &&
    secretKey == initSecretKey &&
    authHeader == initAuthHeader &&
    internalUrl == initInternalUrl &&
    portalUrl == initPortalUrl &&
    isDisabledCertificat == initIsDisabledCertificat;

  const saveButtonDisabled =
    isFormEmpty ||
    isValuesInit ||
    !allInputsValid ||
    isSaveLoading ||
    isResetLoading;

  if (showPortalSettingsLoader || !ready) return <SettingsDSConnectSkeleton />;

  return (
    <Styled.Location>
      <Styled.LocationHeader>
        <div className={styles.main}>
          {t("Settings:DocumentServiceLocationHeaderHelp")}
        </div>
        {documentServiceSettingsUrl ? (
          <Link
            className={styles.thirdPartyLink}
            color={currentColorScheme.main?.accent}
            isHovered
            target="_blank"
            href={documentServiceSettingsUrl}
            dataTestId="integration_settings_link"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </Styled.LocationHeader>

      <Styled.LocationForm onSubmit={onSubmit}>
        {!isDocsConnectAvailable ? null : showConnectEditorsBanner ? (
          <div className={styles.docsConnectPromo}>
            <div className={styles.docsConnectPromoText}>
              <Text className={styles.docsConnectPromoTitle}>
                {t("Settings:DocsConnectReadyTitle")}
              </Text>
              <Text className={styles.docsConnectPromoDescription}>
                {t("Settings:DocsConnectReadyDescription", {
                  organizationName: getBrandName("OrganizationName"),
                  editorsName: getBrandName("ProductEditorsName"),
                })}
              </Text>
            </div>
            <Button
              className={styles.docsConnectPromoButton}
              size={ButtonSize.small}
              primary
              label={t("Settings:ConnectEditors")}
              onClick={() => setConnectDialogVisible(true)}
              isDisabled={isSaveLoading || isResetLoading || isConnecting}
              dataTestId="docs_connect_connect_editors"
            />
          </div>
        ) : (
          <div className={styles.docsConnectPromo}>
            <div className={styles.docsConnectPromoText}>
              <Text className={styles.docsConnectPromoTitle}>
                {t("Settings:DocsConnectPromoTitle")}
              </Text>
              <Text className={styles.docsConnectPromoDescription}>
                {t("Settings:DocsConnectPromoDescription", {
                  organizationName: getBrandName("OrganizationName"),
                  editorsName: getBrandName("ProductEditorsName"),
                })}
              </Text>
            </div>
            <Button
              className={styles.docsConnectPromoButton}
              size={ButtonSize.small}
              primary
              label={t("Common:LearnMore")}
              onClick={() => window.open(apiBasicLink, "_blank")}
            />
          </div>
        )}

        <div className={styles.formInputs}>
          <div className={styles.inputWrapper}>
            <Label
              htmlFor="docServiceAdress"
              text={t("Settings:DocumentServiceLocationUrlApi")}
            />
            <InputBlock
              id="docServiceAdress"
              type="text"
              autoComplete="off"
              tabIndex={1}
              scale
              iconButtonClassName="icon-button"
              value={docServiceUrl}
              onChange={onChangeDocServiceUrl}
              placeholder={EDITOR_URL_PLACEHOLDER}
              hasError={!docServiceUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
              dataTestId="editor_url_input_block"
            />
            <Text className={styles.subtitle}>
              {t("Common:Example", {
                example: EDITOR_URL_PLACEHOLDER,
              })}
            </Text>
            <Checkbox
              id="isDisabledCertificat"
              label={t("Settings:DocumentServiceDisableCertificat")}
              className={styles.checkbox}
              isChecked={isDisabledCertificat}
              onChange={onChangeIsDisabledCertificat}
              isDisabled={isSaveLoading || isResetLoading}
              dataTestId="disable_certificat_checkbox"
            />
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.groupLabel}>
              <Label
                htmlFor="secretKey"
                text={t("Settings:DocumentServiceSecretKey")}
              />
              <Text className={styles.labelSubtitle}>
                {`(${t("Settings:DocumentServiceSecretKeySubtitle")})`}
              </Text>
            </div>
            <InputBlock
              id="secretKey"
              name="secret_key"
              type="text"
              autoComplete="off"
              tabIndex={2}
              scale
              noIcon
              value={secretKey}
              onChange={onChangeSecretKey}
              isDisabled={isSaveLoading || isResetLoading}
              dataTestId="secret_key_input"
            />
            <Text className={styles.subtitle}>
              {t("Settings:DocumentServiceSecretKeySubtitle")}
            </Text>
          </div>
        </div>

        <div className={styles.formInputs}>
          <Styled.LocationSubheader>
            {t("Settings:DocumentServiceAdvancedSettings")}
            <Link
              className="advanced-link"
              type="action"
              isHovered
              onClick={onChangeIsShowAdvancedSettings}
              dataTestId="show_hide_advanced_settings_link"
            >
              {!isShowAdvancedSettings
                ? t("Settings:DocumentServiceShow")
                : t("Settings:DocumentServiceHide")}
            </Link>
          </Styled.LocationSubheader>

          {isShowAdvancedSettings ? (
            <>
              <div className={styles.inputWrapper}>
                <Label
                  htmlFor="authHeader"
                  text={t("Settings:DocumentServiceAuthHeader")}
                />
                <InputBlock
                  id="authHeader"
                  type="text"
                  autoComplete="off"
                  tabIndex={3}
                  scale
                  iconButtonClassName="icon-button"
                  value={authHeader}
                  onChange={onChangeAuthHeader}
                  isDisabled={isSaveLoading || isResetLoading}
                  dataTestId="auth_header_input_block"
                />
                <Text className={styles.subtitle}>
                  {t("Settings:DocumentServiceAuthHeaderSubtitle")}
                </Text>
              </div>
              <div className={styles.inputWrapper}>
                <Label
                  htmlFor="internalAdress"
                  text={t("Settings:DocumentServiceLocationUrlInternal")}
                />
                <InputBlock
                  id="internalAdress"
                  type="text"
                  autoComplete="off"
                  tabIndex={4}
                  scale
                  iconButtonClassName="icon-button"
                  value={internalUrl}
                  onChange={onChangeInternalUrl}
                  placeholder={EDITOR_URL_PLACEHOLDER}
                  hasError={!internalUrlIsValid}
                  isDisabled={isSaveLoading || isResetLoading}
                  dataTestId="editor_url_input_block"
                />
                <Text className={styles.subtitle}>
                  {t("Common:Example", {
                    example: EDITOR_URL_PLACEHOLDER,
                  })}
                </Text>
              </div>
              <div className={styles.inputWrapper}>
                <Label
                  htmlFor="portalAdress"
                  text={t("Settings:DocumentServiceLocationUrlPortal")}
                />
                <InputBlock
                  id="portalAdress"
                  type="text"
                  autoComplete="off"
                  tabIndex={5}
                  scale
                  iconButtonClassName="icon-button"
                  value={portalUrl}
                  onChange={onChangePortalUrl}
                  placeholder={DNS_PLACEHOLDER}
                  hasError={!portalUrlIsValid}
                  isDisabled={isSaveLoading || isResetLoading}
                  dataTestId="dns_input_block"
                />
                <Text className={styles.subtitle}>
                  {t("Common:Example", {
                    example: `${window.location.origin}`,
                  })}
                </Text>
              </div>
            </>
          ) : null}
        </div>

        <SaveCancelButtons
          onSaveClick={onSubmit}
          onCancelClick={onReset}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Settings:DefaultSettings")}
          reminderText={t("Common:YouHaveUnsavedChanges")}
          saveButtonDisabled={saveButtonDisabled}
          disableRestoreToDefault={
            isDefaultSettings || isSaveLoading || isResetLoading
          }
          displaySettings
          isSaving={isSaveLoading || isResetLoading}
          showReminder={!saveButtonDisabled}
          saveButtonDataTestId="settings_save_button"
          cancelButtonDataTestId="default_settings_button"
        />
      </Styled.LocationForm>

      {connectDialogVisible ? (
        <ApplyToPortalDialog
          visible
          isSaving={isConnecting}
          onApply={onConnectDocsConnect}
          onClose={() => setConnectDialogVisible(false)}
        />
      ) : null}
    </Styled.Location>
  );
};

export default inject(
  ({
    settingsStore,
    filesSettingsStore,
    clientLoadingStore,
    docsConnectStore,
  }) => {
    const {
      currentColorScheme,
      documentServiceSettingsUrl,
      currentDeviceType,
      apiBasicLink,
    } = settingsStore;
    const {
      changeDocumentServiceLocation,
      documentServiceLocation: initialDocumentServiceData,
    } = filesSettingsStore;
    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      changeDocumentServiceLocation,
      currentColorScheme,
      documentServiceSettingsUrl,
      currentDeviceType,
      showPortalSettingsLoader,
      initialDocumentServiceData,
      apiBasicLink,
      docsConnectConnection: docsConnectStore.connectionData,
      fetchDocsConnectConnection: docsConnectStore.fetchConnection,
      applyDocsConnectToPortal: docsConnectStore.applyToDocumentService,
      isDocsConnectAvailable: docsConnectStore.isPortalConnectionAvailable,
    };
  },
)(observer(DocumentService));
