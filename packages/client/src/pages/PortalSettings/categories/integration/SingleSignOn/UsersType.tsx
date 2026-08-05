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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { isMobile } from "@docspace/shared/utils";

import AccessSelector from "SRC_DIR/components/AccessSelector";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import StyledInputWrapper from "./styled-containers/StyledInputWrapper";
import { getBrandName } from "@docspace/shared/constants/brands";

interface UsersTypeProps {
  usersType: number;
  setUsersType: (value: number) => void;
  enableSso: boolean;
  isLoadingXml: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

const UsersType = (props: UsersTypeProps) => {
  const { t } = useTranslation(["Ldap", "Common"]);
  const { usersType, setUsersType, enableSso, isLoadingXml, isOwner, isAdmin } =
    props;

  const onChangeUserType = (option: TOption) => {
    if ("access" in option && typeof option.access === "number") {
      setUsersType(option.access);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "24px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: "4px",
          margin: "0 0 8px 0",
        }}
      >
        <Text fontWeight={600} fontSize="15px" lineHeight="16px">
          {t("LdapUsersType")}
        </Text>
      </div>
      <StyledInputWrapper>
        <Text fontWeight={400} fontSize="12px" lineHeight="16px">
          {t("LdapUserTypeTooltip", {
            productName: getBrandName("ProductName"),
          })}
        </Text>
        <AccessSelector
          className="access-selector"
          t={t}
          manualWidth={352}
          roomType={-1}
          defaultAccess={usersType}
          onSelectAccess={onChangeUserType}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isMobileView={isMobile()}
          isDisabled={!enableSso || isLoadingXml}
          directionX="left"
          scaledOptions={!isMobile()}
        />
      </StyledInputWrapper>
    </div>
  );
};

export default inject<TStore>(({ ssoStore, userStore }) => {
  const { usersType, setUsersType, enableSso, isLoadingXml } = ssoStore;
  const { user } = userStore;
  const isOwner = user?.isOwner;
  const isAdmin = user?.isAdmin || user?.isOwner;

  return {
    usersType,
    setUsersType,
    enableSso,
    isLoadingXml,
    isOwner,
    isAdmin,
  };
})(observer(UsersType));
