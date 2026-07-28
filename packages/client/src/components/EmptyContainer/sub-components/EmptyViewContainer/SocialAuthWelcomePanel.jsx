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

import React from "react";
import { withTranslation } from "react-i18next";

import { ColumnarInfoBar } from "@docspace/ui-kit/components/columnar-info-bar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { getBrandName } from "@docspace/shared/constants/brands";
import PencilSvgUrl from "PUBLIC_DIR/images/pencil.outline.react.svg?url";

const SocialAuthWelcomePanel = ({
  t,
  onClose,
  tenantAlias,
  baseDomain,
  user,
  onChangeDomainClick,
  onChangePasswordClick,
}) => {
  const domain =
    baseDomain === "localhost" ? baseDomain : `${tenantAlias}.${baseDomain}`;

  const columns = [
    {
      label: t("SocialAuthWelcomeDialog:ProductNameDetail", {
        productName: getBrandName("ProductName"),
      }),
      value: (
        <>
          <span>{domain}</span>
          <IconButton
            iconName={PencilSvgUrl}
            size={12}
            onClick={onChangeDomainClick}
            aria-label={t("Common:ChangeButton")}
            isFill
          />
        </>
      ),
    },
    {
      label: t("Common:Name"),
      value: (
        <span>{`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}</span>
      ),
    },
    {
      label: t("Common:Email"),
      value: <span>{user?.email}</span>,
    },
    {
      label: t("Common:Password"),
      value: (
        <Link
          type={LinkType.action}
          fontSize="13px"
          fontWeight="600"
          textDecoration="underline"
          color="var(--accent-main)"
          onClick={onChangePasswordClick}
        >
          {t("SocialAuthWelcomeDialog:SetEmailPassword")}
        </Link>
      ),
    },
  ];

  return (
    <ColumnarInfoBar
      headerText={t("SocialAuthWelcomeDialog:YourProfileDetails")}
      columns={columns}
      onAction={onClose}
      variant="page"
    />
  );
};

export default withTranslation(["SocialAuthWelcomeDialog", "Common"])(
  SocialAuthWelcomePanel,
);

