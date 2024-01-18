import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import * as Styled from "./index.styled";

import { Link } from "@docspace/shared/components/link";
import { Button } from "@docspace/shared/components/button";
import { InputBlock } from "@docspace/shared/components/input-block";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import Loaders from "@docspace/common/components/Loaders";
import { DeviceType } from "@docspace/shared/enums";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

const URL_REGEX = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\/?$/;
const DNS_PLACEHOLDER = `${window.location.protocol}//<docspace-dns-name>/`;
const EDITOR_URL_PLACEHOLDER = `${window.location.protocol}//<editors-dns-name>/`;

const DocumentService = ({
  getDocumentServiceLocation,
  changeDocumentServiceLocation,
  currentColorScheme,
  integrationSettingsUrl,
  currentDeviceType,
}) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setSaveIsLoading] = useState(false);
  const [isResetLoading, setResetIsLoading] = useState(false);

  const [isDefaultSettings, setIsDefaultSettiings] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");
  const [portalUrlIsValid, setPortalUrlIsValid] = useState(true);
  const [docServiceUrl, setDocServiceUrl] = useState("");
  const [docServiceUrlIsValid, setDocServiceUrlIsValid] = useState(true);
  const [internalUrl, setInternalUrl] = useState("");
  const [internalUrlIsValid, setInternalUrlIsValid] = useState(true);

  const [initPortalUrl, setInitPortalUrl] = useState("");
  const [initDocServiceUrl, setInitDocServiceUrl] = useState("");
  const [initInternalUrl, setInitInternalUrl] = useState("");

  useEffect(() => {
    setIsLoading(true);
    getDocumentServiceLocation()
      .then((result) => {
        setIsDefaultSettiings(result?.isDefault || false);

        setPortalUrl(result?.docServicePortalUrl);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitDocServiceUrl(result?.docServiceUrl);
      })
      .catch((error) => toastr.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const onChangeDocServiceUrl = (e) => {
    setDocServiceUrl(e.target.value);
    if (!e.target.value) setDocServiceUrlIsValid(true);
    else setDocServiceUrlIsValid(URL_REGEX.test(e.target.value));
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
    changeDocumentServiceLocation(docServiceUrl, internalUrl, portalUrl)
      .then((result) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));

        setIsDefaultSettiings(result?.isDefault || false);

        setPortalUrl(result?.docServicePortalUrl);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitDocServiceUrl(result?.docServiceUrl);
      })
      .catch((e) => toastr.error(e))
      .finally(() => setSaveIsLoading(false));
  };

  const onReset = () => {
    setDocServiceUrlIsValid(true);
    setInternalUrlIsValid(true);
    setPortalUrlIsValid(true);

    setResetIsLoading(true);
    changeDocumentServiceLocation(null, null, null)
      .then((result) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));

        setIsDefaultSettiings(result?.isDefault || false);

        setPortalUrl(result?.docServicePortalUrl);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitDocServiceUrl(result?.docServiceUrl);
      })
      .catch((e) => toastr.error(e))
      .finally(() => setResetIsLoading(false));
  };

  const isFormEmpty = !docServiceUrl && !internalUrl && !portalUrl;
  const allInputsValid =
    docServiceUrlIsValid && internalUrlIsValid && portalUrlIsValid;

  const isValuesInit =
    docServiceUrl == initDocServiceUrl &&
    internalUrl == initInternalUrl &&
    portalUrl == initPortalUrl;

  if (isLoading || !ready) return <Loaders.SettingsDSConnect />;

  const buttonSize =
    currentDeviceType === DeviceType.desktop ? "small" : "normal";

  return (
    <Styled.Location>
      <Styled.LocationHeader>
        <div className="main">
          {t("Settings:DocumentServiceLocationHeaderHelp")}
        </div>

        <Link
          className="third-party-link"
          color={currentColorScheme.main.accent}
          isHovered
          target="_blank"
          href={integrationSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
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
              iconButtonClassName={"icon-button"}
              value={docServiceUrl}
              onChange={onChangeDocServiceUrl}
              placeholder={EDITOR_URL_PLACEHOLDER}
              hasError={!docServiceUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
            />
            <Text className="subtitle">
              {t("Common:Example", {
                example: EDITOR_URL_PLACEHOLDER,
              })}
            </Text>
          </div>
          <div className="input-wrapper">
            <Label
              htmlFor="internalAdress"
              text={t("Settings:DocumentServiceLocationUrlInternal")}
            />
            <InputBlock
              id="internalAdress"
              type="text"
              autoComplete="off"
              tabIndex={2}
              scale
              iconButtonClassName={"icon-button"}
              value={internalUrl}
              onChange={onChangeInternalUrl}
              placeholder={EDITOR_URL_PLACEHOLDER}
              hasError={!internalUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
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
              text={t("Settings:DocumentServiceLocationUrlPortal")}
            />
            <InputBlock
              id="portalAdress"
              type="text"
              autoComplete="off"
              tabIndex={3}
              scale
              iconButtonClassName={"icon-button"}
              value={portalUrl}
              onChange={onChangePortalUrl}
              placeholder={DNS_PLACEHOLDER}
              hasError={!portalUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
            />
            <Text className="subtitle">
              {t("Common:Example", {
                example: `${window.location.origin}`,
              })}
            </Text>
          </div>
        </div>

        <SaveCancelButtons
          onSaveClick={onSubmit}
          onCancelClick={onReset}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:Restore")}
          saveButtonDisabled={
            isFormEmpty ||
            isValuesInit ||
            !allInputsValid ||
            isSaveLoading ||
            isResetLoading
          }
          cancelButtonDisabled={
            isDefaultSettings || isSaveLoading || isResetLoading
          }
          displaySettings={true}
          isSaving={isSaveLoading || isResetLoading}
        />
      </Styled.LocationForm>
    </Styled.Location>
  );
};

export default inject(({ auth, settingsStore }) => {
  const { currentColorScheme, integrationSettingsUrl, currentDeviceType } =
    auth.settingsStore;
  const { getDocumentServiceLocation, changeDocumentServiceLocation } =
    settingsStore;
  return {
    getDocumentServiceLocation,
    changeDocumentServiceLocation,
    currentColorScheme,
    integrationSettingsUrl,
    currentDeviceType,
  };
})(observer(DocumentService));
