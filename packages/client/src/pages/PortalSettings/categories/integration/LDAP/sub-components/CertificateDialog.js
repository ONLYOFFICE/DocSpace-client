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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import classnames from "classnames";

import { LDAPCertificateProblem } from "@docspace/shared/enums";
import styles from "../styled-containers/StyledCerticateDialog.module.scss";

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
        <div className={classnames(styles.styledCertificateDialogBody, { [styles.hasError]: hasError })}>
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
        </div>
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
