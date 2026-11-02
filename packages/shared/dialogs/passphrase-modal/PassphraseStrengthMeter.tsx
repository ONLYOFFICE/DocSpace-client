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

import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import {
  checkPassphraseStrength,
  type PassphraseStrength,
} from "@docspace/shared/services/encryption/passphrase-strength";

import styles from "./PassphraseModal.module.scss";

const STRENGTH_COLOR: Record<PassphraseStrength, string> = {
  weak: "var(--status-error)",
  fair: "var(--status-warning)",
  good: "var(--status-icon-color-positive)",
  strong: "var(--status-icon-color-positive)",
};

/** The strength of a new passphrase and the common-pattern warning; nothing while it is empty. */
export const PassphraseStrengthMeter = ({
  passphrase,
}: {
  passphrase: string;
}) => {
  const { t } = useTranslation(["Common"]);
  if (!passphrase) return null;

  const strengthLabel = (strength: PassphraseStrength): string => {
    switch (strength) {
      case "weak":
        return t("Common:PassphraseStrengthWeak");
      case "fair":
        return t("Common:PassphraseStrengthFair");
      case "good":
        return t("Common:PassphraseStrengthGood");
      case "strong":
        return t("Common:PassphraseStrengthStrong");
      default:
        return "";
    }
  };

  const result = checkPassphraseStrength(passphrase);
  return (
    <>
      <div className={styles.strengthRow} data-testid="passphrase_strength">
        <Text fontSize="12px" color="var(--text-secondary)">
          {t("Common:PassphraseStrengthLabel")}:{" "}
        </Text>
        <Text
          fontSize="12px"
          fontWeight={600}
          color={STRENGTH_COLOR[result.strength]}
        >
          {strengthLabel(result.strength)}
        </Text>
      </div>
      {result.containsCommonPattern ? (
        <Text fontSize="12px" color="var(--status-error)">
          {t("Common:PassphraseCommonPattern")}
        </Text>
      ) : null}
    </>
  );
};
