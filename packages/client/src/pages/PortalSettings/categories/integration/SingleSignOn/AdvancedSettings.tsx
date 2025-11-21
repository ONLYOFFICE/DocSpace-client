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
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";

interface InjectedProps {
  hideAuthPage: boolean;
  disableEmailVerification: boolean;
  enableSso: boolean;
  isLoadingXml: boolean;
  setCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledWrapper = styled.div`
  margin: 24px 0;

  .advanced-title {
    margin-bottom: 16px;
  }

  .advanced-block {
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;

    .help-icon {
      position: relative;
      bottom: 2px;
    }
  }

  .checkbox-input {
    width: fit-content;
    margin-inline: 0 4px;
  }
`;

const AdvancedSettings = (props: InjectedProps) => {
  const {
    hideAuthPage,
    disableEmailVerification,
    enableSso,
    isLoadingXml,
    setCheckbox,
  } = props;
  const { t } = useTranslation(["SingleSignOn", "Settings", "Common"]);
  return (
    <StyledWrapper>
      <Text className="advanced-title" fontWeight={600} fontSize="14px">
        {t("AdvancedSettings")}
      </Text>

      <div className="advanced-block">
        <Checkbox
          id="hide-auth-page"
          className="checkbox-input"
          label={t("HideAuthPage")}
          name="hideAuthPage"
          isChecked={hideAuthPage}
          isDisabled={!enableSso || isLoadingXml}
          onChange={setCheckbox}
          dataTestId="hide_auth_page_checkbox"
        />
        <HelpButton
          tooltipContent={t("AdvancedSettingsTooltip")}
          dataTestId="hide_auth_page_help_button"
        />
      </div>

      <div className="advanced-block">
        <Checkbox
          id="disable-email-verification"
          className="checkbox-input"
          label={t("Settings:DisableEmailVerification")}
          name="disableEmailVerification"
          isChecked={disableEmailVerification}
          isDisabled={!enableSso || isLoadingXml}
          onChange={setCheckbox}
          dataTestId="disable_email_verification_checkbox"
        />
        <HelpButton
          tooltipContent={t("Settings:DisableEmailDescription", {
            sectionName: t("Common:SSO"),
            productName: t("Common:ProductName"),
          })}
          dataTestId="disable_email_verification_help_button"
        />
      </div>
    </StyledWrapper>
  );
};

export default inject<TStore>(({ ssoStore }) => {
  const {
    hideAuthPage,
    disableEmailVerification,
    enableSso,
    isLoadingXml,
    setCheckbox,
  } = ssoStore;

  return {
    hideAuthPage,
    disableEmailVerification,
    enableSso,
    isLoadingXml,
    setCheckbox,
  };
})(observer(AdvancedSettings));
