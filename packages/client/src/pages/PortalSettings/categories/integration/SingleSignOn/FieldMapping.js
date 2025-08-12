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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import { SSO_GIVEN_NAME, SSO_SN, SSO_EMAIL } from "SRC_DIR/helpers/constants";
import SsoFormField from "./sub-components/SsoFormField";

const StyledWrapper = styled.div`
  .icon-button {
    padding: 0 5px;
  }

  .attribute-matching-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex-direction: row;
    font-size: 14px;
    margin: 24px 0 16px 0;
  }
`;

const FieldMapping = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Common"]);
  const {
    firstName,
    lastName,
    email,
    firstNameHasError,
    lastNameHasError,
    emailHasError,
  } = props;

  return (
    <StyledWrapper>
      <div className="attribute-matching-box">
        <Text as="h2" fontSize="15px" fontWeight={600}>
          {t("AttributeMatching")}
        </Text>

        <HelpButton
          className="attribute-matching-tooltip icon-button"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">{t("AttributeMatchingTooltip")}</Text>
          }
          dataTestId="attribute_mapping_help_button"
        />
      </div>

      <SsoFormField
        labelText={t("Common:FirstName")}
        name="firstName"
        placeholder={SSO_GIVEN_NAME}
        tabIndex={16}
        value={firstName}
        hasError={firstNameHasError}
        dataTestId="first_name_field"
      />

      <SsoFormField
        labelText={t("Common:LastName")}
        name="lastName"
        placeholder={SSO_SN}
        tabIndex={17}
        value={lastName}
        hasError={lastNameHasError}
        dataTestId="last_name_field"
      />

      <SsoFormField
        labelText={t("Common:Email")}
        name="email"
        placeholder={SSO_EMAIL}
        tabIndex={18}
        value={email}
        hasError={emailHasError}
        dataTestId="email_field"
      />

      {/* <SsoFormField
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
  /> */}
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
    firstNameHasError,
    lastNameHasError,
    emailHasError,
    locationHasError,
    titleHasError,
    phoneHasError,
  };
})(observer(FieldMapping));
