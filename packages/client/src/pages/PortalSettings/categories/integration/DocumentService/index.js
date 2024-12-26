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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link } from "@docspace/shared/components/link";
import { InputBlock } from "@docspace/shared/components/input-block";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { SettingsDSConnectSkeleton } from "@docspace/shared/skeletons/settings";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import * as Styled from "./index.styled";

const URL_REGEX = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\/?$/;
const DNS_PLACEHOLDER = `${window.location.protocol}//<docspace-dns-name>/`;
const EDITOR_URL_PLACEHOLDER = `${window.location.protocol}//<editors-dns-name>/`;

const DocumentService = ({
  getDocumentServiceLocation,
  changeDocumentServiceLocation,
  currentColorScheme,
  integrationSettingsUrl,
}) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setSaveIsLoading] = useState(false);
  const [isResetLoading, setResetIsLoading] = useState(false);

  const [isDefaultSettings, setIsDefaultSettings] = useState(false);
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
    setDocumentTitle(t("DocumentService"));
    setIsLoading(true);
    getDocumentServiceLocation()
      .then((result) => {
        setIsDefaultSettings(result?.isDefault || false);

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

        setIsDefaultSettings(result?.isDefault || false);

        setPortalUrl(result?.docServicePortalUrl);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);

        setInitPortalUrl(result?.docServicePortalUrl);
        setInitInternalUrl(result?.docServiceUrlInternal);
        setInitDocServiceUrl(result?.docServiceUrl);
      })
      .catch((err) => toastr.error(err))
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

        setIsDefaultSettings(result?.isDefault || false);

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

  if (isLoading || !ready) return <SettingsDSConnectSkeleton />;

  const saveButtonDisabled =
    isFormEmpty ||
    isValuesInit ||
    !allInputsValid ||
    isSaveLoading ||
    isResetLoading;

  return (
    <Styled.Location>
      <Styled.LocationHeader>
        <div className="main">
          {t("Settings:DocumentServiceLocationHeaderHelp")}
        </div>

        <Link
          className="third-party-link"
          color={currentColorScheme.main?.accent}
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
              iconButtonClassName="icon-button"
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
              text={t("Settings:DocumentServiceLocationUrlInternal", {
                productName: t("Common:ProductName"),
              })}
            />
            <InputBlock
              id="internalAdress"
              type="text"
              autoComplete="off"
              tabIndex={2}
              scale
              iconButtonClassName="icon-button"
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
              text={t("Settings:DocumentServiceLocationUrlPortal", {
                productName: t("Common:ProductName"),
              })}
            />
            <InputBlock
              id="portalAdress"
              type="text"
              autoComplete="off"
              tabIndex={3}
              scale
              iconButtonClassName="icon-button"
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
          cancelButtonLabel={t("Settings:DefaultSettings")}
          reminderText={t("Settings:YouHaveUnsavedChanges")}
          saveButtonDisabled={saveButtonDisabled}
          disableRestoreToDefault={
            isDefaultSettings || isSaveLoading || isResetLoading
          }
          displaySettings
          isSaving={isSaveLoading || isResetLoading}
          showReminder={!saveButtonDisabled}
        />
      </Styled.LocationForm>
    </Styled.Location>
  );
};

export default inject(({ settingsStore, filesSettingsStore }) => {
  const { currentColorScheme, integrationSettingsUrl, currentDeviceType } =
    settingsStore;
  const { getDocumentServiceLocation, changeDocumentServiceLocation } =
    filesSettingsStore;
  return {
    getDocumentServiceLocation,
    changeDocumentServiceLocation,
    currentColorScheme,
    integrationSettingsUrl,
    currentDeviceType,
  };
})(observer(DocumentService));
