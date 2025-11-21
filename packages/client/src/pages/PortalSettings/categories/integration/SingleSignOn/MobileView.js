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

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { MobileCategoryWrapper } from "@docspace/shared/components/mobile-category-wrapper";

const StyledWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MobileView = ({ isSSOAvailable, logoText }) => {
  const { t } = useTranslation(["SingleSignOn", "Settings"]);
  const navigate = useNavigate();

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <StyledWrapper>
      <MobileCategoryWrapper
        title={t("ServiceProviderSettings", {
          organizationName: logoText,
        })}
        subtitle={t("ServiceProviderSettingsDescription")}
        url="/portal-settings/integration/sso/settings"
        withPaidBadge={!isSSOAvailable}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
        dataTestId="sp_settings"
      />
      <MobileCategoryWrapper
        title={t("SpMetadata", {
          organizationName: logoText,
        })}
        subtitle={t("SpMetadataDescription", {
          productName: t("Common:ProductName"),
          organizationName: logoText,
        })}
        url="/portal-settings/integration/sso/metadata"
        withPaidBadge={!isSSOAvailable}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
        dataTestId="sp_metadata"
      />
    </StyledWrapper>
  );
};

export default MobileView;
