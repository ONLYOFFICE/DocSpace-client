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

import { inject, observer } from "mobx-react";

import styles from "./FieldMapping.module.scss";
import { useTranslation } from "react-i18next";

import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

import { SSO_GIVEN_NAME, SSO_SN, SSO_EMAIL } from "SRC_DIR/helpers/constants";
import SsoFormField from "./sub-components/SsoFormField";


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
    <div className={styles.styledWrapper}>
      <div className={styles.attributeMatchingBox}>
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
    </div>
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
