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

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { isMobile } from "@docspace/shared/utils";

import AccessSelector from "SRC_DIR/components/AccessSelector";
import StyledInputWrapper from "./styled-containers/StyledInputWrapper";

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

  const onChangeUserType = (option: any) => {
    setUsersType(option.access);
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
            productName: t("Common:ProductName"),
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
  const isAdmin = user?.isAdmin;

  return {
    usersType,
    setUsersType,
    enableSso,
    isLoadingXml,
    isOwner,
    isAdmin,
  };
})(observer(UsersType));
