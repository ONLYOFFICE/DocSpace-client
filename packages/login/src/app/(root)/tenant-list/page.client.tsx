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

"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import { TPortal } from "@/types";

import StyledTenantList from "./page.styled";
import Item from "./_sub-components/Item";

type TenantListProps = {
  baseDomain: string;
  clientId: string;
};

const TenantList = ({ clientId, baseDomain }: TenantListProps) => {
  const router = useRouter();
  const { t } = useTranslation(["TenantList"]);

  const data: { portals: TPortal[] } =
    JSON.parse(sessionStorage.getItem("tenant-list") ?? "") || [];

  const goToLogin = () => {
    sessionStorage.removeItem("tenant-list");

    router.push(`/?type=oauth2&client_id=${clientId}`);
  };

  return (
    <StyledTenantList>
      <Text className="more-accounts">{t("MorePortals")}</Text>
      <div className="items-list">
        {data.portals.map((item) => (
          <Item portal={item} key={item.portalName} baseDomain={baseDomain} />
        ))}
      </div>
      <Button
        onClick={goToLogin}
        label={t("BackToSignIn")}
        className="back-button"
        testId="back_to_login_button"
      />
    </StyledTenantList>
  );
};

export default TenantList;
