// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link } from "@docspace/shared/components/link";
import { InputBlock } from "@docspace/shared/components/input-block";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { toastr } from "@docspace/shared/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { SettingsDSConnectSkeleton } from "@docspace/shared/skeletons/settings";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import * as Styled from "./index.styled";

const URL_REGEX =
  /^(?:https?:\/\/(?:[^\/]+\/)?|^\/)[-a-zA-Z0-9@:%._\+~#=]{1,256}\/?$/;
const DNS_PLACEHOLDER = `${window.location.protocol}//<docspace-dns-name>/`;
const EDITOR_URL_PLACEHOLDER = `${window.location.protocol}//<editors-dns-name>/`;

const DocumentService = ({
  changeDocumentServiceLocation,
  currentColorScheme,
  integrationSettingsUrl,
  initialDocumentServiceData,
  showPortalSettingsLoader,
}) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [isSaveLoading, setSaveIsLoading] = useState(false);
  const [isResetLoading, setResetIsLoading] = useState(false);

  const [docServiceUrl, setDocServiceUrl] = useState("");
  const [docServiceUrlIsValid, setDocServiceUrlIsValid] = useState(true);

  const [isDisabledCertificat, setIsDisabledCertificat] = useState(false);

  const [secretKey, setSecretKey] = useState("");
  const [authHeader, setAuthHeader] = useState("");

  const [portalUrl, setPortalUrl] = useState("");
  const [portalUrlIsValid, setPortalUrlIsValid] = useState(true);
  const [internalUrl, setInternalUrl] = useState("");
  const [internalUrlIsValid, setInternalUrlIsValid] = useState(true);

  const [isDefaultSettings, setIsDefaultSettings] = useState(false);
  const [isShowAdvancedSettings, setIsShowAdvancedSettings] = useState(false);

  const [initPortalUrl, setInitPortalUrl] = useState("");
  const [initSecretKey, setInitSecretKey] = useState("");
  const [initAuthHeader, setInitAuthHeader] = useState("");
  const [initDocServiceUrl, setInitDocServiceUrl] = useState("");
  const [initInternalUrl, setInitInternalUrl] = useState("");
  const [initIsDisabledCertificat, setInitIsDisabledCertificat] =
    useState(false);

  useEffect(() => {
    setDocumentTitle(t("DocumentService"));
  }, [t]);

  useEffect(() => {
    if (initialDocumentServiceData) {
      const result = initialDocumentServiceData;
      setIsDefaultSettings(result?.isDefault || false);
      setPortalUrl(result?.docServicePortalUrl);
      setSecretKey(result?.docServiceSignatureSecret);
      setAuthHeader(result?.docServiceSignatureHeader);
      setInternalUrl(result?.docServiceUrlInternal);
      setDocServiceUrl(result?.docServiceUrl);
      setIsDisabledCertificat(!result?.docServiceSslVerification || false);

      setInitPortalUrl(result?.docServicePortalUrl);
      setInitSecretKey(result?.docServiceSignatureSecret);
      setInitAuthHeader(result?.docServiceSignatureHeader);
      setInitDocServiceUrl(result?.docServiceUrl);
      setInitInternalUrl(result?.docServiceUrlInternal);
      setInitIsDisabledCertificat(!result?.docServiceSslVerification || false);
    }
  }, [initialDocumentServiceData]);

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
    setSecretKey(e.target.value);
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
      secretKey,
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
        setSecretKey(result?.docServiceSignatureSecret);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);
        setIsDisabledCertificat(!result?.docServiceSslVerification || false);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitSecretKey(result?.docServiceSignatureSecret);
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
        setSecretKey(result?.docServiceSignatureSecret);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);
        setIsDisabledCertificat(!result?.docServiceSslVerification || false);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitSecretKey(result?.docServiceSignatureSecret);
        setInitAuthHeader(result?.docServiceSignatureHeader);
        setInitDocServiceUrl(result?.docServiceUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitIsDisabledCertificat(
          !result?.docServiceSslVerification || false,
        );
      })
      .catch((e) => toastr.error(e))
      .finally(() => setResetIsLoading(false));
  };

  const isFormEmpty =
    !docServiceUrl && !internalUrl && !portalUrl && !authHeader && !secretKey;
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
        <div className="main">
          {t("Settings:DocumentServiceLocationHeaderHelp")}
        </div>
        {integrationSettingsUrl ? (
          <Link
            className="third-party-link"
            color={currentColorScheme.main?.accent}
            isHovered
            target="_blank"
            href={integrationSettingsUrl}
            dataTestId="integration_settings_link"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </Styled.LocationHeader>

      <Styled.LocationForm onSubmit={onSubmit}>
        <div className="form-inputs">
          <div className="input-wrapper">
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
            <Text className="subtitle">
              {t("Common:Example", {
                example: EDITOR_URL_PLACEHOLDER,
              })}
            </Text>
            <Checkbox
              id="isDisabledCertificat"
              label={t("Settings:DocumentServiceDisableCertificat")}
              className="checkbox"
              isChecked={isDisabledCertificat}
              onChange={onChangeIsDisabledCertificat}
              isDisabled={isSaveLoading || isResetLoading}
              dataTestId="disable_certificat_checkbox"
            />
          </div>
          <div className="input-wrapper">
            <div className="group-label">
              <Label
                htmlFor="secretKey"
                text={t("Settings:DocumentServiceSecretKey")}
              />
              <Text className="label-subtitle">
                {`(${t("Settings:DocumentServiceSecretKeySubtitle")})`}
              </Text>
            </div>
            <PasswordInput
              id="secretKey"
              type="password"
              simpleView
              tabIndex={2}
              scale
              inputValue={secretKey}
              onChange={onChangeSecretKey}
              isDisabled={isSaveLoading || isResetLoading}
              className="password-input"
              testId="secret_key_input"
            />
            <Text className="subtitle">
              {t("Settings:DocumentServiceSecretKeySubtitle")}
            </Text>
          </div>
        </div>

        <div className="form-inputs">
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
              <div className="input-wrapper">
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
                <Text className="subtitle">
                  {t("Settings:DocumentServiceAuthHeaderSubtitle")}
                </Text>
              </div>
              <div className="input-wrapper">
                <Label
                  htmlFor="internalAdress"
                  text={t("Settings:DocumentServiceLocationUrlInternal", {
                    productName: t("Common:ProductName"),
                  })}
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
                <Text className="subtitle">
                  {t("Common:Example", {
                    example: EDITOR_URL_PLACEHOLDER,
                  })}
                </Text>
              </div>
              <div className="input-wrapper">
                <Label
                  htmlFor="portalAdress"
                  text={t("Settings:DocumentServiceLocationUrlPortal", {
                    productName: t("Common:ProductName"),
                  })}
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
                <Text className="subtitle">
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
    </Styled.Location>
  );
};

export default inject(
  ({ settingsStore, filesSettingsStore, clientLoadingStore }) => {
    const { currentColorScheme, integrationSettingsUrl, currentDeviceType } =
      settingsStore;
    const {
      changeDocumentServiceLocation,
      documentServiceLocation: initialDocumentServiceData,
    } = filesSettingsStore;
    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      changeDocumentServiceLocation,
      currentColorScheme,
      integrationSettingsUrl,
      currentDeviceType,
      showPortalSettingsLoader,
      initialDocumentServiceData,
    };
  },
)(observer(DocumentService));
