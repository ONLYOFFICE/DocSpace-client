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

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import styles from "../Webhooks.styled.module.scss";

import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

import { useTranslation } from "react-i18next";

export const SSLVerification = ({ onChange, value, isDisabled }) => {
  const { t } = useTranslation(["Webhooks"]);

  const handleOnChange = (e) => {
    onChange({
      target: { name: e.target.name, value: e.target.value === "true" },
    });
  };

  return (
    <div>
      <h4 className={styles.sslHeader}>
        {t("SSLVerification")}{" "}
        <HelpButton
          className="verificationHelpButton"
          iconName={InfoReactSvgUrl}
          tooltipContent={<Text fontSize="12px">{t("SSLHint")}</Text>}
          place="bottom"
          dataTestId="ssl_verification_help_button"
        />
      </h4>
      <RadioButtonGroup
        fontSize="13px"
        fontWeight="400"
        name="ssl"
        onClick={handleOnChange}
        options={[
          {
            id: "enable-ssl",
            label: t("EnableSSL"),
            value: "true",
            dataTestId: "enable_ssl_radio_button",
          },
          {
            id: "disable-ssl",
            label: t("DisableSSL"),
            value: "false",
            dataTestId: "disable_ssl_radio_button",
          },
        ]}
        selected={value ? "true" : "false"}
        width="100%"
        orientation="vertical"
        spacing="8px"
        isDisabled={isDisabled}
        dataTestId="ssl_verification_radio_button_group"
      />
    </div>
  );
};
