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

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import FileSvgUrl from "PUBLIC_DIR/images/icons/32/file.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { now, parseToDateTime, isAfter } from "@docspace/ui-kit/utils/date";

import { Text } from "@docspace/ui-kit/components/text";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";

import certTableStyles from "../styled-containers/StyledCertificatesTable.module.scss";

const CertificatesTable = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Common"]);
  const {
    prefix,
    setSpCertificate,
    setIdpCertificate,
    delSpCertificate,
    delIdpCertificate,
    idpCertificates,
    spCertificates,
  } = props;

  const renderRow = (certificate, index) => {
    const onEdit = () => {
      prefix === "sp"
        ? setSpCertificate(certificate, index, true)
        : setIdpCertificate(certificate, index, true);
    };

    const onDelete = () => {
      prefix === "sp"
        ? delSpCertificate(certificate.action)
        : delIdpCertificate(certificate.crt);
    };

    const contextOptions = [
      {
        id: "edit",
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: onEdit,
      },
      {
        id: "delete",
        key: "delete",
        label: t("Common:Delete"),
        icon: CatalogTrashReactSvgUrl,
        onClick: onDelete,
      },
    ];

    const getOptions = () => contextOptions;

    const getFullDate = (date) => {
      return `${new Date(date).toLocaleDateString()}`;
    };

    const isExpired = isAfter(now(), parseToDateTime(certificate.expiredDate));

    return (
      <div key={`certificate-${index}`} className="row">
        <ReactSVG src={FileSvgUrl} />
        <div className="column">
          <div className="column-row">
            <Text fontWeight={600} fontSize="14px" lineHeight="16px">
              {certificate.domainName}
            </Text>
          </div>
          <div className="column-row">
            <Text
              className={isExpired ? "error-description" : "description"}
              fontSize="12px"
              fontWeight={600}
              lineHeight="16px"
            >
              {certificate.action}
              {" | "}
              {getFullDate(certificate.startDate)}
              {" - "}
              {getFullDate(certificate.expiredDate)}
            </Text>
          </div>
        </div>
        <ContextMenuButton
          className="context-btn"
          getData={getOptions}
          usePortal
        />
      </div>
    );
  };

  return (
    <div className={certTableStyles.styledCertificatesTable}>
      <div className="body">
        {prefix === "idp"
          ? idpCertificates.map((cert, index) => renderRow(cert, index))
          : null}

        {prefix === "sp"
          ? spCertificates.map((cert, index) => renderRow(cert, index))
          : null}
      </div>
    </div>
  );
};

export default inject(({ ssoStore }) => {
  const {
    setSpCertificate,
    setIdpCertificate,
    delSpCertificate,
    delIdpCertificate,
    idpCertificates,
    spCertificates,
  } = ssoStore;

  return {
    setSpCertificate,
    setIdpCertificate,
    delSpCertificate,
    delIdpCertificate,
    idpCertificates,
    spCertificates,
  };
})(observer(CertificatesTable));
