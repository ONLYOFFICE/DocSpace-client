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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

import { LDAPCertificateProblem } from "@docspace/shared/enums";
import StyledCertificateDialogBody from "../styled-components/StyledCerticateDialog";

const CertificateDialog = ({
  setCertificateDialogVisible,
  setAcceptCertificate,
  setAcceptCertificateHash,
  save,
  isCertificateDialogVisible,
  cerficateIssue,
}) => {
  const { t } = useTranslation(["Ldap", "Common"]);

  const onCloseAction = useCallback(() => {
    setCertificateDialogVisible(false);
  }, []);

  const onCancelAction = useCallback(() => {
    setCertificateDialogVisible(false);
  }, []);

  const onSaveAction = useCallback(() => {
    setAcceptCertificate(true);
    setAcceptCertificateHash(cerficateIssue.uniqueHash);
    save(t);
    setCertificateDialogVisible(false);
  }, []);

  const mapError = (error) => {
    switch (error) {
      case LDAPCertificateProblem.CertExpired:
        return t("LdapSettingsCertExpired");
      case LDAPCertificateProblem.CertCnNoMatch:
        return t("LdapSettingsCertCnNoMatch");
      case LDAPCertificateProblem.CertIssuerChaining:
        return t("LdapSettingsCertIssuerChaining");
      case LDAPCertificateProblem.CertUntrustedCa:
        return t("LdapSettingsCertUntrustedCa");
      case LDAPCertificateProblem.CertUntrustedRoot:
        return t("LdapSettingsCertUntrustedRoot");
      case LDAPCertificateProblem.CertMalformed:
        return t("LdapSettingsCertMalformed");
      case LDAPCertificateProblem.CertUnrecognizedError:
        return t("LdapSettingsCertUnrecognizedError");
      case LDAPCertificateProblem.CertValidityPeriodNesting:
      case LDAPCertificateProblem.CertRole:
      case LDAPCertificateProblem.CertPathLenConst:
      case LDAPCertificateProblem.CertCritical:
      case LDAPCertificateProblem.CertPurpose:
      case LDAPCertificateProblem.CertChainnig:
      case LDAPCertificateProblem.CertRevoked:
      case LDAPCertificateProblem.CertUntrustedTestRoot:
      case LDAPCertificateProblem.CertRevocationFailure:
      case LDAPCertificateProblem.CertWrongUsage:
        return "";
      default:
        break;
    }

    return "";
  };

  const hasError = cerficateIssue.errors?.length > 0;

  return (
    <ModalDialog
      autoMaxHeight
      autoMaxWidth
      visible={isCertificateDialogVisible}
      displayType={ModalDialogType.modal}
      onClose={onCloseAction}
    >
      <ModalDialog.Header>{t("LdapCertificateConfirm")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledCertificateDialogBody hasError={hasError}>
          <div className="ldap-settings-crt-confirmation">
            <Text lineHeight="20px" fontSize="13px" fontWeight="400">
              {t("LdapAddCertificateToStoreConfirmation")}
            </Text>
          </div>
          <div className="ldap-settings-crt-details">
            <Text as="p">
              {t("LdapSettingsSerialNumber")}: {cerficateIssue.serialNumber}
            </Text>

            <Text as="p">
              {t("LdapSettingsIssuerName")}: {cerficateIssue.issuerName}
            </Text>

            <Text as="p">
              {t("LdapSettingsSubjectName")}: {cerficateIssue.subjectName}
            </Text>

            <Text as="p">
              {t("LdapSettingsValidFrom")}: {cerficateIssue.validFrom}
            </Text>

            <Text as="p">
              {t("LdapSettingsValidUntil")}: {cerficateIssue.validUntil}
            </Text>

            <Text as="p">
              {t("LdapSettingsUniqueHash")}: {cerficateIssue.uniqueHash}
            </Text>
          </div>
          {hasError ? (
            <div>
              {cerficateIssue.errors.map((err) => (
                <Text className="ldap-error-text" key={`err-${err}`}>
                  {mapError(err)}
                </Text>
              ))}
            </div>
          ) : null}
        </StyledCertificateDialogBody>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="submit"
          key="LdapCertificateConfirmBtn"
          label={t("Common:OKButton")}
          size="normal"
          type="submit"
          primary
          onClick={onSaveAction}
        />
        <Button
          className="cancel-button"
          key="LdapCertificateCloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCancelAction}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ ldapStore }) => {
  const {
    setCertificateDialogVisible,
    setAcceptCertificate,
    setAcceptCertificateHash,
    save,
    isCertificateDialogVisible,
    cerficateIssue,
  } = ldapStore;

  return {
    setCertificateDialogVisible,
    setAcceptCertificate,
    setAcceptCertificateHash,
    save,
    isCertificateDialogVisible,
    cerficateIssue,
  };
})(observer(CertificateDialog));
