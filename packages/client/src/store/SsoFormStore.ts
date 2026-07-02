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

import { makeAutoObservable } from "mobx";
import axios from "axios";
import type { AxiosResponse } from "axios";
import isEqual from "lodash/isEqual";
import {
  generateCerts,
  getCurrentSsoSettings,
  loadXmlMetadata,
  resetSsoForm,
  submitSsoForm,
  uploadXmlMetadata,
  validateCerts,
} from "@docspace/shared/api/settings";
import type {
  TGetSsoSettings,
  TSsoCertificate,
  TSsoIdpSettings,
} from "@docspace/shared/api/settings/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TTranslation } from "@docspace/shared/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import { EmployeeType } from "@docspace/shared/enums";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import type { ChangeEvent } from "react";
import {
  BINDING_POST,
  BINDING_REDIRECT,
  SSO_GIVEN_NAME,
  SSO_SN,
  SSO_EMAIL,
  SSO_LOCATION,
  SSO_TITLE,
  SSO_PHONE,
  SSO_NAME_ID_FORMAT,
  SSO_SIGNING,
  SSO_ENCRYPT,
  SSO_SIGNING_ENCRYPT,
} from "../helpers/constants";

// FABLE5-REVIEW: loadXmlMetadata/uploadXmlMetadata/validateCerts/generateCerts
// in shared/api/settings are untyped (raw axios calls), so their responses are
// cast at the call sites below.

/** Endpoint entry of the parsed IdP XML metadata (binding/location pair). */
type TSsoMetadataService = {
  binding?: string;
  location?: string;
} & Record<string, unknown>;

/** Shape of the parsed IdP XML metadata returned by /sso/loadmetadata and /sso/uploadmetadata. */
type TUploadedXmlMetadata = {
  entityID?: string;
  singleSignOnService?: TSsoMetadataService | TSsoMetadataService[];
  singleLogoutService?: TSsoMetadataService;
  nameIDFormat?: string | string[];
  certificate?: {
    signing?: string | string[];
  };
};

class SsoFormStore {
  isSsoEnabled = false;

  enableSso = false;

  uploadXmlUrl = "";

  spLoginLabel = "";

  isLoadingXml = false;

  // idpSettings
  entityId = "";

  ssoUrlPost = "";

  ssoUrlRedirect = "";

  ssoBinding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

  sloUrlPost = "";

  sloUrlRedirect = "";

  sloBinding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

  nameIdFormat = SSO_NAME_ID_FORMAT[0];

  idpCertificate = "";

  idpPrivateKey: string | null = null;

  idpAction = SSO_SIGNING;

  idpCertificates: TSsoCertificate[] = [];

  // idpCertificateAdvanced
  idpDecryptAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";

  // no checkbox for that
  ipdDecryptAssertions = false;

  idpVerifyAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";

  idpVerifyAuthResponsesSign = false;

  idpVerifyLogoutRequestsSign = false;

  idpVerifyLogoutResponsesSign = false;

  spCertificate = "";

  spPrivateKey: string | null = "";

  spAction = SSO_SIGNING;

  spCertificates: TSsoCertificate[] = [];

  // spCertificateAdvanced
  // null for some reason and no checkbox
  spDecryptAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";

  spEncryptAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";

  spEncryptAssertions = false;

  spSignAuthRequests = false;

  spSignLogoutRequests = false;

  spSignLogoutResponses = false;

  spSigningAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
  // spVerifyAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";

  // Field mapping
  firstName = SSO_GIVEN_NAME;

  lastName = SSO_SN;

  email = SSO_EMAIL;

  location = SSO_LOCATION;

  title = SSO_TITLE;

  phone = SSO_PHONE;

  usersType: EmployeeType = EmployeeType.User;

  hideAuthPage = false;

  disableEmailVerification = false;
  // sp metadata

  spEntityId = "";

  spAssertionConsumerUrl = "";

  spSingleLogoutUrl = "";

  // hide parts of form
  serviceProviderSettings = false;

  idpShowAdditionalParameters = true;

  spShowAdditionalParameters = true;

  spMetadata = false;

  idpIsModalVisible = false;

  spIsModalVisible = false;

  confirmationResetModal = false;

  // errors
  uploadXmlUrlHasError = false;

  spLoginLabelHasError = false;

  entityIdHasError = false;

  ssoUrlPostHasError = false;

  ssoUrlRedirectHasError = false;

  sloUrlPostHasError = false;

  sloUrlRedirectHasError = false;

  firstNameHasError = false;

  lastNameHasError = false;

  emailHasError = false;

  locationHasError = false;

  titleHasError = false;

  phoneHasError = false;

  // error messages
  // uploadXmlUrlErrorMessage = null;

  errorMessage: string | null = null;

  isSubmitLoading = false;

  isGeneratedCertificate = false;

  isCertificateLoading = false;

  defaultSettings: TGetSsoSettings | null = null;

  editIndex = 0;

  isEdit = false;

  isInit = false;

  settingsStore: SettingsStore | null = null;

  constructor(settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
  }

  init = async () => {
    if (this.isInit) return;
    await this.load();
  };

  setIsInit = (isInit: boolean) => {
    this.isInit = isInit;
  };

  load = async () => {
    const abortController = new AbortController();
    // FABLE5-REVIEW: settingsStore is assigned in the constructor and is never
    // null in practice; `!` preserves the old JS behavior (which would also
    // have thrown on null).
    this.settingsStore!.addAbortControllers(abortController);

    try {
      const res = await getCurrentSsoSettings(abortController.signal);
      this.setIsSsoEnabled(res.enableSso);
      this.setSpMetadata(res.enableSso);
      this.setDefaultSettings(res);
      this.setFields(res);
      this.setIsInit(true);
    } catch (err) {
      if (axios.isCancel(err)) return;

      console.log(err);
    }
  };

  ssoToggle = (t: TTranslation) => {
    if (!this.enableSso) {
      this.enableSso = true;
      this.serviceProviderSettings = true;
    } else {
      this.enableSso = false;
      !this.hasErrors && this.entityId.trim() !== "" && this.saveSsoSettings(t);
      this.hideErrors();
    }

    Object.keys(this).forEach((key) => {
      if (key.includes("ErrorMessage"))
        (this as unknown as Record<string, unknown>)[key] = null;
    });
  };

  setInput = (e: ChangeEvent<HTMLInputElement>) => {
    (this as unknown as Record<string, unknown>)[e.target.name] =
      e.target.value;
  };

  setComboBox = (option: TOption, field: string) => {
    (this as unknown as Record<string, unknown>)[field] = option.key;
  };

  setHideLabel = (label: string) => {
    const self = this as unknown as Record<string, unknown>;
    self[label] = !self[label];
  };

  setCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    (this as unknown as Record<string, unknown>)[e.target.name] =
      e.target.checked;
  };

  setUsersType = (usersType: EmployeeType) => {
    this.usersType = usersType;
  };

  openIdpModal = () => {
    this.idpIsModalVisible = true;
  };

  openSpModal = () => {
    this.spIsModalVisible = true;
  };

  closeIdpModal = () => {
    this.idpCertificate = "";
    this.idpPrivateKey = "";
    this.editIndex = 0;
    this.isEdit = false;
    this.idpIsModalVisible = false;
  };

  closeSpModal = () => {
    this.spCertificate = "";
    this.spPrivateKey = "";
    this.spIsModalVisible = false;
    this.editIndex = 0;
    this.isEdit = false;
  };

  setComboBoxOption = (option: TOption) => {
    this.spAction = option.key as string;
  };

  setIsSsoEnabled = (isSsoEnabled: boolean) => {
    this.isSsoEnabled = isSsoEnabled;
  };

  setSpMetadata = (spMetadata: boolean) => {
    this.spMetadata = spMetadata;
  };

  setDefaultSettings = (defaultSettings: TGetSsoSettings) => {
    this.defaultSettings = defaultSettings;
  };

  openResetModal = () => {
    this.confirmationResetModal = true;
  };

  closeResetModal = () => {
    this.confirmationResetModal = false;
  };

  confirmReset = () => {
    this.resetForm();
    this.setIsSsoEnabled(false);
    this.serviceProviderSettings = false;
    this.setSpMetadata(false);
    this.confirmationResetModal = false;
  };

  uploadByUrl = async (t: TTranslation) => {
    const data = { url: this.uploadXmlUrl };

    try {
      this.isLoadingXml = true;
      const response = (await loadXmlMetadata(data)) as AxiosResponse<{
        meta: TUploadedXmlMetadata;
      }>;
      this.setFieldsFromMetaData(response.data.meta);
      this.hideErrors();
      this.isLoadingXml = false;
    } catch (err) {
      this.isLoadingXml = false;
      toastr.error(t("MetadataLoadError"));
      console.error(err);
    }
  };

  uploadXml = async (file: File) => {
    if (!file.type.includes("text/xml")) return console.log("invalid format");

    const data = new FormData();
    data.append("metadata", file);

    try {
      this.isLoadingXml = true;
      const response = (await uploadXmlMetadata(data)) as AxiosResponse<{
        meta: TUploadedXmlMetadata;
      }>;
      this.setFieldsFromMetaData(response.data.meta);
      this.hideErrors();
      this.isLoadingXml = false;
    } catch (err) {
      this.isLoadingXml = false;
      toastr.error(err as string);
      console.error(err);
    }
  };

  validateCertificate = async (crts: TSsoCertificate[]) => {
    const data = { certs: crts };

    try {
      return (await validateCerts(data)) as AxiosResponse<TSsoCertificate[]>;
    } catch (err) {
      const error = err as { response?: { data?: string } };
      toastr.error(error?.response?.data || (err as string));
      console.error("validateCertificate failed", { err });
    }
  };

  generateCertificate = async () => {
    try {
      this.isGeneratedCertificate = true;

      const res = (await generateCerts()) as AxiosResponse<TSsoCertificate>;
      this.setGeneratedCertificate(res.data);

      this.isGeneratedCertificate = false;
    } catch (err) {
      this.isGeneratedCertificate = false;
      toastr.error(err as string);
      console.error(err);
    }
  };

  getSettings = () => {
    const ssoUrl =
      this.ssoBinding === "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        ? this.ssoUrlPost
        : this.ssoUrlRedirect;
    const sloUrl =
      this.sloBinding === "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        ? this.sloUrlPost
        : this.sloUrlRedirect;

    return {
      enableSso: this.enableSso,
      spLoginLabel: this.spLoginLabel,
      idpSettings: {
        entityId: this.entityId,
        ssoUrl,
        ssoBinding: this.ssoBinding,
        sloUrl,
        sloBinding: this.sloBinding,
        nameIdFormat: this.nameIdFormat,
      },
      idpCertificates: this.idpCertificates,
      idpCertificateAdvanced: {
        verifyAlgorithm: this.idpVerifyAlgorithm,
        verifyAuthResponsesSign: this.idpVerifyAuthResponsesSign,
        verifyLogoutRequestsSign: this.idpVerifyLogoutRequestsSign,
        verifyLogoutResponsesSign: this.idpVerifyLogoutResponsesSign,
        decryptAlgorithm: this.idpDecryptAlgorithm,
        decryptAssertions: false,
      },
      spCertificates: this.spCertificates,
      spCertificateAdvanced: {
        decryptAlgorithm: this.spDecryptAlgorithm,
        signingAlgorithm: this.spSigningAlgorithm,
        signAuthRequests: this.spSignAuthRequests,
        signLogoutRequests: this.spSignLogoutRequests,
        signLogoutResponses: this.spSignLogoutResponses,
        encryptAlgorithm: this.spEncryptAlgorithm,
        encryptAssertions: this.spEncryptAssertions,
      },
      fieldMapping: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        title: this.title,
        location: this.location,
        phone: this.phone,
      },
      hideAuthPage: this.hideAuthPage,
      disableEmailVerification: this.disableEmailVerification,
      usersType: this.usersType,
    };
  };

  saveSsoSettings = async (t: TTranslation) => {
    this.checkRequiredFields();

    const settings = this.getSettings();
    const data = { serializeSettings: JSON.stringify(settings) };

    this.isSubmitLoading = true;

    try {
      await submitSsoForm(data);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      this.isSubmitLoading = false;
      this.load();
    } catch (err) {
      toastr.error(err as string);
      console.error(err);
      this.isSubmitLoading = false;
    }
  };

  resetForm = async () => {
    try {
      // FABLE5-REVIEW: resetSsoForm is untyped in shared/api (returns
      // request(options) without a generic); the DELETE /settings/ssov2
      // endpoint returns the default SSO settings object.
      const config = (await resetSsoForm()) as TGetSsoSettings;

      this.setFields(config);
      this.hideErrors();
    } catch (err) {
      toastr.error(err as string);
      console.error(err);
    }
  };

  setFields = (config: TGetSsoSettings) => {
    const {
      enableSso,
      idpSettings,
      idpCertificates,
      idpCertificateAdvanced,
      uploadXmlUrl,
      spLoginLabel,
      spCertificates,
      spCertificateAdvanced,
      fieldMapping,
      hideAuthPage,
      disableEmailVerification,
      usersType,
    } = config;
    const { entityId, ssoBinding, sloBinding, nameIdFormat } = idpSettings;
    const {
      verifyAlgorithm,
      verifyAuthResponsesSign,
      verifyLogoutRequestsSign,
      verifyLogoutResponsesSign,
      decryptAlgorithm,
      decryptAssertions,
    } = idpCertificateAdvanced;
    const { firstName, lastName, email, title, location, phone } = fieldMapping;

    const {
      signingAlgorithm,
      signAuthRequests,
      signLogoutRequests,
      signLogoutResponses,
      encryptAlgorithm,
      decryptAlgorithm: spDecryptAlgorithm,
      encryptAssertions,
    } = spCertificateAdvanced;

    this.enableSso = enableSso;

    // idpSettings
    this.entityId = entityId;
    this.ssoBinding = ssoBinding;
    this.setSsoUrls(idpSettings);

    this.sloBinding = sloBinding;
    this.setSloUrls(idpSettings);

    this.nameIdFormat = nameIdFormat;

    // idpCertificates
    this.idpCertificates = [...idpCertificates];

    // idpCertificateAdvanced
    this.idpVerifyAlgorithm = verifyAlgorithm;
    this.idpVerifyAuthResponsesSign = verifyAuthResponsesSign;
    this.idpVerifyLogoutRequestsSign = verifyLogoutRequestsSign;
    this.idpVerifyLogoutResponsesSign = verifyLogoutResponsesSign;
    this.idpDecryptAlgorithm = decryptAlgorithm;
    this.ipdDecryptAssertions = decryptAssertions;

    this.spLoginLabel = spLoginLabel || "";
    this.uploadXmlUrl = uploadXmlUrl || "";

    this.serviceProviderSettings = false;

    // spCertificates
    this.spCertificates = [...spCertificates];

    // spCertificateAdvanced
    this.spSigningAlgorithm = signingAlgorithm;
    this.spSignAuthRequests = signAuthRequests;
    this.spSignLogoutRequests = signLogoutRequests;
    this.spSignLogoutResponses = signLogoutResponses;
    this.spEncryptAlgorithm = encryptAlgorithm;
    this.spDecryptAlgorithm = spDecryptAlgorithm;
    this.spEncryptAssertions = encryptAssertions;

    // fieldMapping
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.title = title;
    this.location = location;
    this.phone = phone;

    this.hideAuthPage = hideAuthPage;
    this.disableEmailVerification = disableEmailVerification;
    this.usersType = usersType || EmployeeType.User;
  };

  setSsoUrls = (o: TSsoIdpSettings) => {
    switch (o.ssoBinding) {
      case BINDING_POST:
        this.ssoUrlPost = o.ssoUrl;
        break;
      case BINDING_REDIRECT:
        this.ssoUrlRedirect = o.ssoUrl;
        break;
      default:
        break;
    }
  };

  setSloUrls = (o: TSsoIdpSettings) => {
    switch (o.sloBinding) {
      case BINDING_POST:
        this.sloUrlPost = o.sloUrl;
        break;
      case BINDING_REDIRECT:
        this.sloUrlRedirect = o.sloUrl;
        break;
      default:
        break;
    }
  };

  getPropValue = (
    obj: TSsoMetadataService | TSsoMetadataService[] | undefined,
    propName: string,
  ) => {
    let value = "";

    if (!obj) return value;

    // FABLE5-REVIEW: parsed XML metadata values are untyped on the server
    // side; the old JS returned whatever was stored under the property, the
    // `as string` casts below preserve that behavior.
    if (hasOwnProperty(obj, propName))
      return (obj as Record<string, unknown>)[propName] as string;

    if (
      hasOwnProperty(obj, "binding") &&
      hasOwnProperty(obj, "location") &&
      (obj as TSsoMetadataService).binding == propName
    )
      return (obj as TSsoMetadataService).location as string;

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (hasOwnProperty(item, propName)) {
          value = (item as Record<string, unknown>)[propName] as string;
          return;
        }

        if (
          hasOwnProperty(item, "binding") &&
          hasOwnProperty(item, "location") &&
          item.binding == propName
        ) {
          value = item.location as string;
        }
      });
    }

    return value;
  };

  includePropertyValue = (obj: object, value: string) => {
    const props = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < props.length; i++) {
      if ((obj as Record<string, unknown>)[props[i]] === value) return true;
    }
    return false;
  };

  setFieldsFromMetaData = async (meta: TUploadedXmlMetadata) => {
    if (meta.entityID) {
      this.entityId = meta.entityID || "";
    }

    if (meta.singleSignOnService) {
      this.ssoUrlPost = this.getPropValue(
        meta.singleSignOnService,
        BINDING_POST,
      );

      this.ssoUrlRedirect = this.getPropValue(
        meta.singleSignOnService,
        BINDING_REDIRECT,
      );
    }

    if (meta.singleLogoutService) {
      if (meta.singleLogoutService.binding) {
        this.sloBinding = meta.singleLogoutService.binding;
      }

      this.sloUrlRedirect = this.getPropValue(
        meta.singleLogoutService,
        BINDING_REDIRECT,
      );

      this.sloUrlPost = this.getPropValue(
        meta.singleLogoutService,
        BINDING_POST,
      );
    }

    if (meta.nameIDFormat) {
      if (Array.isArray(meta.nameIDFormat)) {
        const formats = meta.nameIDFormat.filter((format) => {
          return this.includePropertyValue(SSO_NAME_ID_FORMAT, format);
        });
        if (formats.length) {
          this.nameIdFormat = formats[0];
        }
      } else if (
        this.includePropertyValue(SSO_NAME_ID_FORMAT, meta.nameIDFormat)
      ) {
        this.nameIdFormat = meta.nameIDFormat;
      }
    }

    if (meta.certificate) {
      const data: TSsoCertificate[] = [];

      if (meta.certificate.signing) {
        if (Array.isArray(meta.certificate.signing)) {
          meta.certificate.signing = this.getUniqueItems(
            meta.certificate.signing,
          ).reverse();
          meta.certificate.signing.forEach((signingCrt) => {
            data.push({
              crt: signingCrt.trim(),
              key: null,
              action: "verification",
            });
          });
        } else {
          data.push({
            crt: meta.certificate.signing.trim(),
            key: null,
            action: "verification",
          });
        }
      }

      const newCertificates = await this.validateCertificate(data);
      this.idpCertificates = [];

      // FABLE5-REVIEW: validateCertificate returns undefined when validation
      // fails; the old JS would throw on `.data` of undefined here — `!`
      // preserves that behavior.
      newCertificates!.data.forEach((cert) => {
        if (newCertificates!.data.length > 1) {
          this.idpCertificates = [...this.idpCertificates, cert];
        } else {
          this.idpCertificates = [cert];
        }

        if (cert.action === "verification") {
          this.idpVerifyAuthResponsesSign = true;
          this.idpVerifyLogoutRequestsSign = true;
        }
        if (cert.action === "decrypt") {
          this.idpVerifyLogoutResponsesSign = true;
        }
        if (cert.action === "verification and decrypt") {
          this.idpVerifyAuthResponsesSign = true;
          this.idpVerifyLogoutRequestsSign = true;
          this.idpVerifyLogoutResponsesSign = true;
        }
      });
    }
  };

  getUniqueItems = <T,>(inputArray: T[]) => {
    return inputArray.filter(
      (item, index) => inputArray.indexOf(item) === index,
    );
  };

  setSpCertificate = (
    certificate: TSsoCertificate,
    index: number,
    isEdit: boolean,
  ) => {
    this.spCertificate = certificate.crt;
    this.spPrivateKey = certificate.key;
    this.spAction = certificate.action;
    this.editIndex = index;
    this.isEdit = isEdit;
    this.spIsModalVisible = true;
  };

  setIdpCertificate = (
    certificate: TSsoCertificate,
    index: number,
    isEdit: boolean,
  ) => {
    this.idpCertificate = certificate.crt;
    this.idpPrivateKey = certificate.key;
    this.idpAction = certificate.action;
    this.editIndex = index;
    this.isEdit = isEdit;
    this.idpIsModalVisible = true;
  };

  resetSpCheckboxes = (action: string) => {
    if (action === SSO_SIGNING_ENCRYPT) {
      this.spSignAuthRequests = false;
      this.spSignLogoutRequests = false;
      this.spSignLogoutResponses = false;
      this.spEncryptAssertions = false;
    }
    if (action === SSO_SIGNING) {
      this.spSignAuthRequests = false;
      this.spSignLogoutRequests = false;
      this.spSignLogoutResponses = false;
    }
    if (action === SSO_ENCRYPT) {
      this.spEncryptAssertions = false;
    }
  };

  resetIdpCheckboxes = () => {
    this.idpVerifyAuthResponsesSign = false;
    this.idpVerifyLogoutRequestsSign = false;
    this.idpVerifyLogoutResponsesSign = false;
  };

  delSpCertificate = (action: string) => {
    this.resetSpCheckboxes(action);
    this.spCertificates = this.spCertificates.filter(
      (certificate) => certificate.action !== action,
    );
  };

  delIdpCertificate = (cert: string) => {
    this.resetIdpCheckboxes();
    this.idpCertificates = this.idpCertificates.filter(
      (certificate) => certificate.crt !== cert,
    );
  };

  checkSpCertificateExist = () => {
    if (
      this.spAction === SSO_SIGNING_ENCRYPT &&
      this.spCertificates.length > 0 &&
      !this.isEdit
    )
      return true;

    return this.spCertificates.find(
      (item) =>
        (item.action === this.spAction ||
          item.action === SSO_SIGNING_ENCRYPT) &&
        !this.isEdit,
    );
  };

  addSpCertificate = async (t: TTranslation) => {
    const data = [
      {
        crt: this.spCertificate,
        key: this.spPrivateKey,
        action: this.spAction,
      },
    ];

    if (this.checkSpCertificateExist()) {
      toastr.error(t("CertificateExist"));
      return;
    }

    this.isCertificateLoading = true;

    try {
      const res = await this.validateCertificate(data);
      if (!res) {
        this.isCertificateLoading = false;
        return;
      }
      const newCertificates = res.data;
      if (this.isEdit) {
        this.spCertificates[this.editIndex] = newCertificates[0];
        this.checkedSpBoxes(newCertificates[0]);
      } else {
        newCertificates.forEach((cert) => {
          this.spCertificates = [...this.spCertificates, cert];
          this.checkedSpBoxes(cert);
        });
      }

      this.isCertificateLoading = false;
      this.closeSpModal();
    } catch (err) {
      this.isCertificateLoading = false;
      toastr.error(err as string);
      console.error(err);
    }
  };

  checkedSpBoxes = (cert: TSsoCertificate) => {
    if (cert.action === SSO_SIGNING) {
      this.spSignAuthRequests = true;
      this.spSignLogoutRequests = true;
    }
    if (cert.action === SSO_ENCRYPT) {
      this.spEncryptAssertions = true;
    }
    if (cert.action === SSO_SIGNING_ENCRYPT) {
      this.spSignAuthRequests = true;
      this.spSignLogoutRequests = true;
      this.spEncryptAssertions = true;
    }
  };

  addIdpCertificate = async (t: TTranslation) => {
    const data = [
      {
        crt: this.idpCertificate,
        key: this.idpPrivateKey,
        action: this.idpAction,
      },
    ];

    if (
      this.idpCertificates.find(
        (item) => item.crt === this.idpCertificate && !this.isEdit,
      )
    ) {
      toastr.error(t("CertificateExist"));
      return;
    }

    this.isCertificateLoading = true;

    try {
      const res = await this.validateCertificate(data);
      if (!res) {
        this.isCertificateLoading = false;
        return;
      }
      const newCertificates = res.data;
      if (this.isEdit) {
        this.idpCertificates[this.editIndex] = newCertificates[0];
        this.checkedIdpBoxes(newCertificates[0]);
      } else {
        newCertificates.forEach((cert) => {
          this.idpCertificates = [...this.idpCertificates, cert];
          this.checkedIdpBoxes(cert);
        });
      }
      this.isCertificateLoading = false;
      this.closeIdpModal();
    } catch (err) {
      this.isCertificateLoading = false;
      toastr.error(err as string);
      console.error(err);
    }
  };

  checkedIdpBoxes = (cert: TSsoCertificate) => {
    if (cert.action === "verification") {
      this.idpVerifyAuthResponsesSign = true;
      this.idpVerifyLogoutRequestsSign = true;
    }
    if (cert.action === "decrypt") {
      this.idpVerifyLogoutResponsesSign = true;
    }
    if (cert.action === "verification and decrypt") {
      this.idpVerifyAuthResponsesSign = true;
      this.idpVerifyLogoutRequestsSign = true;
      this.idpVerifyLogoutResponsesSign = true;
    }
  };

  setGeneratedCertificate = (certificateObject: TSsoCertificate) => {
    this.spCertificate = certificateObject.crt;
    this.spPrivateKey = certificateObject.key;
  };

  getError = (field: string) => {
    const fieldError = `${field}HasError`;
    console.log("getError", fieldError);
    return (this as unknown as Record<string, unknown>)[fieldError] !== null;
  };

  setError = (field: string, value: string | boolean) => {
    if (typeof value === "boolean") return;

    const fieldError = `${field}HasError`;

    try {
      this.validate(value);
      (this as unknown as Record<string, unknown>)[fieldError] = false;
      this.errorMessage = null;
    } catch (err) {
      (this as unknown as Record<string, unknown>)[fieldError] = true;
      this.errorMessage = (err as Error).message;
    }
  };

  hideError = (field: string) => {
    const fieldError = `${field}HasError`;
    (this as unknown as Record<string, unknown>)[fieldError] = false;
    this.errorMessage = null;
  };

  hideErrors = () => {
    Object.keys(this).forEach((key) => {
      const self = this as unknown as Record<string, unknown>;
      if (key.includes("HasError") && self[key] !== false) {
        console.log("key", key);
        self[key] = false;
      }
    });
  };

  validate = (string: string) => {
    if (string.trim().length === 0) throw new Error("EmptyFieldError");
    else return true;
  };

  downloadMetadata = async () => {
    window.open("/sso/metadata", "_blank");
  };

  checkRequiredFields = () => {
    this.setError("spLoginLabel", this.spLoginLabel);
    this.setError("entityId", this.entityId);
    this.ssoBinding === BINDING_POST &&
      this.setError("ssoUrlPost", this.ssoUrlPost);
    this.ssoBinding === BINDING_REDIRECT &&
      this.setError("ssoUrlRedirect", this.ssoUrlRedirect);
    this.sloBinding === BINDING_POST &&
      this.setError("sloUrlPost", this.sloUrlPost);
    this.sloBinding === BINDING_REDIRECT &&
      this.setError("sloUrlRedirect", this.sloUrlRedirect);
    this.setError("firstName", this.firstName);
    this.setError("lastName", this.lastName);
    this.setError("email", this.email);

    if (this.hasErrors) {
      this.scrollToField();
    }
  };

  get hasErrors() {
    return Object.keys(this).some(
      (key) =>
        key.includes("HasError") &&
        (this as unknown as Record<string, unknown>)[key] !== false,
    );
  }

  get hasChanges() {
    const currentSettings = this.getSettings();
    return !isEqual(currentSettings, this.defaultSettings);
  }

  get isDisabledIdpSigning() {
    if (!this.enableSso || this.isLoadingXml) return true;
    return this.idpCertificates.length === 0;
  }

  get isDisabledSpSigning() {
    if (!this.enableSso || this.isLoadingXml) return true;
    return !this.spCertificates.some(
      (cert) =>
        cert.action === SSO_SIGNING || cert.action === SSO_SIGNING_ENCRYPT,
    );
  }

  get isDisabledSpEncrypt() {
    if (!this.enableSso || this.isLoadingXml) return true;
    return !this.spCertificates.some(
      (cert) =>
        cert.action === SSO_ENCRYPT || cert.action === SSO_SIGNING_ENCRYPT,
    );
  }

  get isDisabledSaveButton() {
    return (
      !this.enableSso ||
      this.hasErrors ||
      !this.hasChanges ||
      this.isLoadingXml ||
      this.isRequiredFieldsEmpty
    );
  }

  get isRequiredFieldsEmpty() {
    return (
      this.spLoginLabel.trim().length === 0 ||
      this.entityId.trim().length === 0 ||
      (this.ssoBinding === BINDING_POST &&
        this.ssoUrlPost.trim().length === 0) ||
      (this.sloBinding === BINDING_POST &&
        this.sloUrlPost.trim().length === 0) ||
      (this.ssoBinding === BINDING_REDIRECT &&
        this.ssoUrlRedirect.trim().length === 0) ||
      (this.sloBinding === BINDING_REDIRECT &&
        this.sloUrlRedirect.trim().length === 0) ||
      this.firstName.trim().length === 0 ||
      this.lastName.trim().length === 0 ||
      this.email.trim().length === 0
    );
  }

  scrollToField = () => {
    Object.keys(this).every((key) => {
      if (
        key.includes("HasError") &&
        (this as unknown as Record<string, unknown>)[key] !== false
      ) {
        const name = key.replace("HasError", "");
        const element = document.getElementsByName(name)?.[0];
        if (element) {
          element.focus();
          element.blur();
        }
        return false;
      }
      return true;
    });
  };
}

export default SsoFormStore;
