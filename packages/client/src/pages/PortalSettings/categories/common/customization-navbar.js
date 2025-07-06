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

import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import withCultureNames from "SRC_DIR/HOCs/withCultureNames";

import { injectDefaultTheme } from "@docspace/shared/utils";
import LoaderCustomizationNavbar from "./sub-components/loaderCustomizationNavbar";
import MobileCategoryWrapper from "../../components/MobileCategoryWrapper";

const StyledComponent = styled.div.attrs(injectDefaultTheme)`
  .combo-button-label {
    max-width: 100%;
  }
`;

const CustomizationNavbar = ({
  t,
  tReady,
  setIsLoadedCustomizationNavbar,
  isLoadedPage,
  isSettingPaid,
  enablePortalRename,
  isEnterprise,
}) => {
  const isLoadedSetting = tReady;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadedSetting) setIsLoadedCustomizationNavbar(isLoadedSetting);
  }, [isLoadedSetting]);

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return !isLoadedPage ? (
    <LoaderCustomizationNavbar />
  ) : (
    <StyledComponent>
      <MobileCategoryWrapper
        title={t("StudioTimeLanguageSettings")}
        subtitle={t("LanguageAndTimeZoneSettingsNavDescription")}
        url="/portal-settings/customization/general/language-and-time-zone"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("CustomTitlesWelcome")}
        subtitle={t("CustomTitlesSettingsNavDescription")}
        url="/portal-settings/customization/general/welcome-page-settings"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("DNSSettings")}
        subtitle={t("DNSSettingsNavDescription")}
        url="/portal-settings/customization/general/dns-settings"
        onClickLink={onClickLink}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
      />
      {enablePortalRename ? (
        <MobileCategoryWrapper
          title={t("PortalRenaming")}
          subtitle={t("PortalRenamingNavDescription")}
          url="/portal-settings/customization/general/portal-renaming"
          onClickLink={onClickLink}
          withPaidBadge={!isSettingPaid}
          badgeLabel={t("Common:Paid")}
        />
      ) : null}
      <MobileCategoryWrapper
        title={t("ConfigureDeepLink")}
        subtitle={t("ConfigureDeepLinkDescription")}
        url="/portal-settings/customization/general/configure-deep-link"
        onClickLink={onClickLink}
      />
      {isEnterprise ? (
        <MobileCategoryWrapper
          title={t("AdManagement")}
          subtitle={t("AdManagementDescription")}
          url="/portal-settings/customization/general/ad-management"
          onClickLink={onClickLink}
        />
      ) : null}
    </StyledComponent>
  );
};

export default inject(({ common, settingsStore, currentTariffStatusStore }) => {
  const { enablePortalRename } = settingsStore;
  const { setIsLoadedCustomizationNavbar } = common;
  const { isEnterprise } = currentTariffStatusStore;
  return {
    setIsLoadedCustomizationNavbar,
    enablePortalRename,
    isEnterprise,
  };
})(
  withCultureNames(
    observer(withTranslation(["Settings", "Common"])(CustomizationNavbar)),
  ),
);
