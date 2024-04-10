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

import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import { Checkbox } from "@docspace/shared/components/checkbox";
import SsoFormField from "./sub-components/SsoFormField";

import {
  SSO_GIVEN_NAME,
  SSO_SN,
  SSO_EMAIL,
  SSO_LOCATION,
  SSO_TITLE,
  SSO_PHONE,
} from "SRC_DIR/helpers/constants";

const StyledWrapper = styled.div`
  .advanced-block {
    margin: 24px 0;

    .field-label {
      font-size: ${(props) => props.theme.getCorrectFontSize("15px")};
      font-weight: 600;
    }
  }

  .checkbox-input {
    margin: 10px 8px 6px 0;
  }

  .icon-button {
    padding: 0 5px;
  }
`;

const FieldMapping = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Common"]);
  const {
    firstName,
    lastName,
    email,
    location,
    title,
    phone,
    hideAuthPage,
    enableSso,
    setCheckbox,
    isLoadingXml,
    firstNameHasError,
    lastNameHasError,
    emailHasError,
    locationHasError,
    titleHasError,
    phoneHasError,
  } = props;

  return (
    <StyledWrapper>
      <Box
        alignItems="center"
        displayProp="flex"
        flexDirection="row"
        fontSize="14px"
        marginProp="24px 0 16px 0"
      >
        <Text as="h2" fontSize="15px" fontWeight={600} noSelect>
          {t("AttributeMatching")}
        </Text>

        <HelpButton
          className="attribute-matching-tooltip icon-button"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">{t("AttributeMatchingTooltip")}</Text>
          }
        />
      </Box>

      <SsoFormField
        labelText={t("Common:FirstName")}
        name="firstName"
        placeholder={SSO_GIVEN_NAME}
        tabIndex={16}
        value={firstName}
        hasError={firstNameHasError}
      />

      <SsoFormField
        labelText={t("Common:LastName")}
        name="lastName"
        placeholder={SSO_SN}
        tabIndex={17}
        value={lastName}
        hasError={lastNameHasError}
      />

      <SsoFormField
        labelText={t("Common:Email")}
        name="email"
        placeholder={SSO_EMAIL}
        tabIndex={18}
        value={email}
        hasError={emailHasError}
      />

      {/*<SsoFormField
        labelText={t("Common:Location")}
        name="location"
        placeholder={SSO_LOCATION}
        tabIndex={19}
        value={location}
        hasError={locationHasError}
      />

      <SsoFormField
        labelText={t("Common:Title")}
        name="title"
        placeholder={SSO_TITLE}
        tabIndex={20}
        value={title}
        hasError={titleHasError}
      />

      <SsoFormField
        labelText={t("Common:Phone")}
        name="phone"
        placeholder={SSO_PHONE}
        tabIndex={21}
        value={phone}
        hasError={phoneHasError}
  />*/}

      <FieldContainer
        className="advanced-block"
        inlineHelpButton
        isVertical
        labelText={t("AdvancedSettings")}
        place="top"
        tooltipContent={
          <Text fontSize="12px">{t("AdvancedSettingsTooltip")}</Text>
        }
        tooltipClass="advanced-settings-tooltip icon-button"
      >
        <Checkbox
          id="hide-auth-page"
          className="checkbox-input"
          label={t("HideAuthPage")}
          name="hideAuthPage"
          tabIndex={22}
          isChecked={hideAuthPage}
          isDisabled={!enableSso || isLoadingXml}
          onChange={setCheckbox}
        />
      </FieldContainer>
    </StyledWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const {
    firstName,
    lastName,
    email,
    location,
    title,
    phone,
    hideAuthPage,
    enableSso,
    setCheckbox,
    isLoadingXml,
    firstNameHasError,
    lastNameHasError,
    emailHasError,
    locationHasError,
    titleHasError,
    phoneHasError,
  } = ssoStore;

  return {
    firstName,
    lastName,
    email,
    location,
    title,
    phone,
    hideAuthPage,
    enableSso,
    setCheckbox,
    isLoadingXml,
    firstNameHasError,
    lastNameHasError,
    emailHasError,
    locationHasError,
    titleHasError,
    phoneHasError,
  };
})(observer(FieldMapping));
