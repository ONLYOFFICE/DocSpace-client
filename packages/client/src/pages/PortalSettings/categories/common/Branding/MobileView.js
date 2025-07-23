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
import { isManagement } from "@docspace/shared/utils/common";
import MobileCategoryWrapper from "../../../components/MobileCategoryWrapper";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileView = ({ isSettingPaid, showSettings, displayAbout }) => {
  const { t } = useTranslation(["Settings"]);
  const navigate = useNavigate();
  const baseUrl = isManagement()
    ? "/management/settings"
    : "/portal-settings/customization";

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <StyledWrapper>
      <MobileCategoryWrapper
        title={t("BrandName")}
        subtitle={t("BrandNameSubtitleMobile")}
        url={`${baseUrl}/branding/brand-name`}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("WhiteLabel")}
        subtitle={t("BrandingSubtitleMobile")}
        url={`${baseUrl}/branding/white-label`}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      {showSettings ? (
        <>
          {displayAbout ? (
            <MobileCategoryWrapper
              title={t("CompanyInfoSettings")}
              subtitle={t("BrandingSectionDescription", {
                productName: t("Common:ProductName"),
              })}
              url={`${baseUrl}/branding/company-info-settings`}
              withPaidBadge={!isSettingPaid}
              badgeLabel={t("Common:Paid")}
              onClickLink={onClickLink}
            />
          ) : null}
          <MobileCategoryWrapper
            title={t("AdditionalResources")}
            subtitle={t("AdditionalResourcesSubtitle")}
            url={`${baseUrl}/branding/additional-resources`}
            withPaidBadge={!isSettingPaid}
            badgeLabel={t("Common:Paid")}
            onClickLink={onClickLink}
          />
        </>
      ) : null}
    </StyledWrapper>
  );
};

export default MobileView;
