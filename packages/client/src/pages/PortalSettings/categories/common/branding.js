// (c) Copyright Ascensio System SIA 2009-2024
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
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { isManagement } from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";

import withLoading from "SRC_DIR/HOCs/withLoading";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { WhiteLabel } from "./Branding/whitelabel";
import { CompanyInfoSettings } from "./Branding/companyInfoSettings";
import { AdditionalResources } from "./Branding/additionalResources";
import MobileView from "./Branding/MobileView";

import LoaderBrandingDescription from "./sub-components/loaderBrandingDescription";
import { UnavailableStyles } from "../../utils/commonSettingsStyles";

const StyledComponent = styled.div`
  max-width: 700px;
  width: 100%;
  font-weight: 400;
  font-size: 13px;

  .header {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    padding-bottom: 9px;
  }

  .description {
    padding-bottom: 16px;
  }

  .settings-block {
    max-width: 433px;
  }

  .section-description {
    color: ${(props) =>
      props.theme.client.settings.common.brandingDescriptionColor};
    line-height: 20px;
    padding-bottom: 20px;
  }

  hr {
    margin: 24px 0;
    border: none;
    border-top: ${(props) => props.theme.client.settings.separatorBorder};
  }

  ${(props) => !props.isSettingPaid && UnavailableStyles}
`;

const Branding = ({
  t,
  isLoadedCompanyInfoSettingsData,
  isSettingPaid,
  standalone,
  deviceType,
  portals,
  displayAbout,
}) => {
  const isMobileView = deviceType === DeviceType.mobile;

  useEffect(() => {
    setDocumentTitle(t("Branding"));
  }, []);

  const hideBlock = isManagement() ? false : portals?.length > 1;

  const showSettings = standalone && !hideBlock;

  if (isMobileView)
    return (
      <MobileView
        isSettingPaid={isSettingPaid || standalone}
        showSettings={showSettings}
        displayAbout={displayAbout}
      />
    );

  return (
    <StyledComponent isSettingPaid={isSettingPaid}>
      <WhiteLabel />
      {showSettings ? (
        <>
          <hr />
          {displayAbout ? (
            <>
              {isLoadedCompanyInfoSettingsData ? (
                <div className="section-description settings_unavailable">
                  {t("Settings:BrandingSectionDescription", {
                    productName: t("Common:ProductName"),
                  })}
                </div>
              ) : (
                <LoaderBrandingDescription />
              )}
              <CompanyInfoSettings />
            </>
          ) : null}
          <AdditionalResources />
        </>
      ) : null}
    </StyledComponent>
  );
};

export default inject(({ settingsStore, currentQuotaStore, brandingStore }) => {
  const { isCustomizationAvailable } = currentQuotaStore;
  const { isLoadedCompanyInfoSettingsData } = brandingStore;
  const {
    standalone,
    portals,
    deviceType,
    checkEnablePortalSettings,
    displayAbout,
  } = settingsStore;
  const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

  return {
    isLoadedCompanyInfoSettingsData,
    isSettingPaid,
    standalone,
    portals,
    deviceType,
    displayAbout,
  };
})(withLoading(withTranslation(["Settings", "Common"])(observer(Branding))));
