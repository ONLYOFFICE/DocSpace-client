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

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import CheckIcon from "PUBLIC_DIR/images/check.react.svg";

import {
  PASSPHRASE_MIN_LENGTH,
  checkPassphraseRules,
} from "@docspace/shared/services/encryption/passphrase-strength";

import styles from "./PassphraseModal.module.scss";

type PassphraseRulesListProps = {
  passphrase: string;
};

// Spec: private-rooms/key-management, "The list of passphrase rules leaves the dialog readable"
export const PassphraseRulesList = ({ passphrase }: PassphraseRulesListProps) => {
  const { t } = useTranslation(["Common"]);
  const met = checkPassphraseRules(passphrase);

  const rules = [
    {
      id: "length",
      met: met.length,
      label: `${t("Common:PasswordMinimumLength")}: ${PASSPHRASE_MIN_LENGTH}`,
    },
    { id: "digits", met: met.digits, label: t("Common:PasswordLimitDigits") },
    {
      id: "capital",
      met: met.capital,
      label: t("Common:PasswordLimitUpperCase"),
    },
    {
      id: "special",
      met: met.special,
      label: t("Common:PasswordLimitSpecialSymbols"),
    },
  ];

  return (
    <div className={styles.rules} data-testid="passphrase_rules">
      <Text fontSize="12px">
        {`${t("Common:PassphraseLimitMessage")}:`}
      </Text>
      <ul className={styles.rulesList}>
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={classNames(styles.rule, { [styles.ruleMet]: rule.met })}
            data-testid={`passphrase_rule_${rule.id}`}
            data-met={rule.met}
          >
            <span className={styles.ruleMark} aria-hidden="true">
              {rule.met ? <CheckIcon /> : null}
            </span>
            <Text as="span" fontSize="12px">
              {rule.label}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PassphraseRulesList;
