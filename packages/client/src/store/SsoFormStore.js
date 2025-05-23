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

import { makeAutoObservable } from "mobx";
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
import { toastr } from "@docspace/shared/components/toast";
import { EmployeeType } from "@docspace/shared/enums";
import { hasOwnProperty } from "@docspace/shared/utils/object";
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

  idpPrivateKey = null;

  idpAction = SSO_SIGNING;

  idpCertificates = [];

  // idpCertificateAdvanced
  idpDecryptAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";

  // no checkbox for that
  ipdDecryptAssertions = false;

  idpVerifyAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";

  idpVerifyAuthResponsesSign = false;

  idpVerifyLogoutRequestsSign = false;

  idpVerifyLogoutResponsesSign = false;

  spCertificate = "";

  spPrivateKey = "";

  spAction = SSO_SIGNING;

  spCertificates = [];

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

  usersType = EmployeeType.User;

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

  errorMessage = null;

  isSubmitLoading = false;

  isGeneratedCertificate = false;

  isCertificateLoading = false;

  defaultSettings = null;

  editIndex = 0;

  isEdit = false;

  isInit = false;

  constructor() {
    makeAutoObservable(this);
  }

  init = () => {
    if (this.isInit) return;
    this.isInit = true;
    this.load();
  };

  load = async () => {
    try {
      const res = await getCurrentSsoSettings();
      this.setIsSsoEnabled(res.enableSso);
      this.setSpMetadata(res.enableSso);
      this.setDefaultSettings(res);
      this.setFields(res);
    } catch (err) {
      console.log(err);
    }
  };

  ssoToggle = (t) => {
    if (!this.enableSso) {
      this.enableSso = true;
      this.serviceProviderSettings = true;
    } else {
      this.enableSso = false;
      !this.hasErrors && this.entityId.trim() !== "" && this.saveSsoSettings(t);
      this.hideErrors();
    }

    Object.keys(this).forEach((key) => {
      if (key.includes("ErrorMessage")) this[key] = null;
    });
  };

  setInput = (e) => {
    this[e.target.name] = e.target.value;
  };

  setComboBox = (option, field) => {
    this[field] = option.key;
  };

  setHideLabel = (label) => {
    this[label] = !this[label];
  };

  setCheckbox = (e) => {
    this[e.target.name] = e.target.checked;
  };

  setUsersType = (usersType) => {
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

  setComboBoxOption = (option) => {
    this.spAction = option.key;
  };

  setIsSsoEnabled = (isSsoEnabled) => {
    this.isSsoEnabled = isSsoEnabled;
  };

  setSpMetadata = (spMetadata) => {
    this.spMetadata = spMetadata;
  };

  setDefaultSettings = (defaultSettings) => {
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

  uploadByUrl = async (t) => {
    const data = { url: this.uploadXmlUrl };

    try {
      this.isLoadingXml = true;
      const response = await loadXmlMetadata(data);
      this.setFieldsFromMetaData(response.data.meta);
      this.hideErrors();
      this.isLoadingXml = false;
    } catch (err) {
      this.isLoadingXml = false;
      toastr.error(t("MetadataLoadError"));
      console.error(err);
    }
  };

  uploadXml = async (file) => {
    if (!file.type.includes("text/xml")) return console.log("invalid format");

    const data = new FormData();
    data.append("metadata", file);

    try {
      this.isLoadingXml = true;
      const response = await uploadXmlMetadata(data);
      this.setFieldsFromMetaData(response.data.meta);
      this.hideErrors();
      this.isLoadingXml = false;
    } catch (err) {
      this.isLoadingXml = false;
      toastr.error(err);
      console.error(err);
    }
  };

  validateCertificate = async (crts) => {
    const data = { certs: crts };

    try {
      return await validateCerts(data);
    } catch (err) {
      toastr.error(err?.response?.data || err);
      console.error("validateCertificate failed", { err });
    }
  };

  generateCertificate = async () => {
    try {
      this.isGeneratedCertificate = true;

      const res = await generateCerts();
      this.setGeneratedCertificate(res.data);

      this.isGeneratedCertificate = false;
    } catch (err) {
      this.isGeneratedCertificate = false;
      toastr.error(err);
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

  saveSsoSettings = async (t) => {
    this.checkRequiredFields();

    const settings = this.getSettings();
    const data = { serializeSettings: JSON.stringify(settings) };

    this.isSubmitLoading = true;

    try {
      await submitSsoForm(data);
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      this.isSubmitLoading = false;
      this.load();
    } catch (err) {
      toastr.error(err);
      console.error(err);
      this.isSubmitLoading = false;
    }
  };

  resetForm = async () => {
    try {
      const config = await resetSsoForm();

      this.setFields(config);
      this.hideErrors();
    } catch (err) {
      toastr.error(err);
      console.error(err);
    }
  };

  setFields = (config) => {
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

  setSsoUrls = (o) => {
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

  setSloUrls = (o) => {
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

  getPropValue = (obj, propName) => {
    let value = "";

    if (!obj) return value;

    if (hasOwnProperty(obj, propName)) return obj[propName];

    if (
      hasOwnProperty(obj, "binding") &&
      hasOwnProperty(obj, "location") &&
      obj.binding == propName
    )
      return obj.location;

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (hasOwnProperty(item, propName)) {
          value = item[propName];
          return;
        }

        if (
          hasOwnProperty(item, "binding") &&
          hasOwnProperty(item, "location") &&
          item.binding == propName
        ) {
          value = item.location;
        }
      });
    }

    return value;
  };

  includePropertyValue = (obj, value) => {
    const props = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < props.length; i++) {
      if (obj[props[i]] === value) return true;
    }
    return false;
  };

  setFieldsFromMetaData = async (meta) => {
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
      const data = [];

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

      newCertificates.data.forEach((cert) => {
        if (newCertificates.data.length > 1) {
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

  getUniqueItems = (inputArray) => {
    return inputArray.filter(
      (item, index) => inputArray.indexOf(item) === index,
    );
  };

  setSpCertificate = (certificate, index, isEdit) => {
    this.spCertificate = certificate.crt;
    this.spPrivateKey = certificate.key;
    this.spAction = certificate.action;
    this.editIndex = index;
    this.isEdit = isEdit;
    this.spIsModalVisible = true;
  };

  setIdpCertificate = (certificate, index, isEdit) => {
    this.idpCertificate = certificate.crt;
    this.idpPrivateKey = certificate.key;
    this.idpAction = certificate.action;
    this.editIndex = index;
    this.isEdit = isEdit;
    this.idpIsModalVisible = true;
  };

  resetSpCheckboxes = (action) => {
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

  delSpCertificate = (action) => {
    this.resetSpCheckboxes(action);
    this.spCertificates = this.spCertificates.filter(
      (certificate) => certificate.action !== action,
    );
  };

  delIdpCertificate = (cert) => {
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

  addSpCertificate = async (t) => {
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
      toastr.error(err);
      console.error(err);
    }
  };

  checkedSpBoxes = (cert) => {
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

  addIdpCertificate = async (t) => {
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
      toastr.error(err);
      console.error(err);
    }
  };

  checkedIdpBoxes = (cert) => {
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

  setGeneratedCertificate = (certificateObject) => {
    this.spCertificate = certificateObject.crt;
    this.spPrivateKey = certificateObject.key;
  };

  getError = (field) => {
    const fieldError = `${field}HasError`;
    console.log("getError", fieldError);
    return this[fieldError] !== null;
  };

  setError = (field, value) => {
    if (typeof value === "boolean") return;

    const fieldError = `${field}HasError`;

    try {
      this.validate(value);
      this[fieldError] = false;
      this.errorMessage = null;
    } catch (err) {
      this[fieldError] = true;
      this.errorMessage = err.message;
    }
  };

  hideError = (field) => {
    const fieldError = `${field}HasError`;
    this[fieldError] = false;
    this.errorMessage = null;
  };

  hideErrors = () => {
    Object.keys(this).forEach((key) => {
      if (key.includes("HasError") && this[key] !== false) {
        console.log("key", key);
        this[key] = false;
      }
    });
  };

  validate = (string) => {
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
      (key) => key.includes("HasError") && this[key] !== false,
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
      if (key.includes("HasError") && this[key] !== false) {
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
