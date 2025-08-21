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

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import FileSvgUrl from "PUBLIC_DIR/images/icons/32/file.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";

import StyledCertificatesTable from "../styled-containers/StyledCertificatesTable";

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

    const isExpired = moment().isAfter(moment(certificate.expiredDate));

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
    <StyledCertificatesTable>
      <div className="body">
        {prefix === "idp"
          ? idpCertificates.map((cert, index) => renderRow(cert, index))
          : null}

        {prefix === "sp"
          ? spCertificates.map((cert, index) => renderRow(cert, index))
          : null}
      </div>
    </StyledCertificatesTable>
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
