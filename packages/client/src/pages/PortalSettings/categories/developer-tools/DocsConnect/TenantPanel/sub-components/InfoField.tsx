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

import { useState } from "react";

import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";

import styles from "../TenantPanel.module.scss";

const InfoField = ({
  label,
  value,
  isSecret,
  onCopy,
  copyTitle,
}: {
  label: string;
  value: string;
  isSecret?: boolean;
  onCopy: (value: string) => void;
  copyTitle: string;
}) => {
  const [revealed, setRevealed] = useState(false);
  const displayValue = isSecret && !revealed ? "•".repeat(24) : value;

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoLabelRow}>
        <Text fontSize="16px" fontWeight={700}>
          {label}
        </Text>
        {isSecret ? (
          <IconButton
            iconName={revealed ? EyeReactSvgUrl : EyeOffReactSvgUrl}
            size={16}
            onClick={() => setRevealed((prev) => !prev)}
            className={styles.eyeIcon}
          />
        ) : null}
      </div>
      <div className={styles.infoValueRow}>
        <Text fontSize="14px" fontWeight={600} truncate>
          {displayValue}
        </Text>
        <IconButton
          iconName={CopyReactSvgUrl}
          size={16}
          onClick={() => onCopy(value)}
          title={copyTitle}
          className={styles.copyIcon}
        />
      </div>
    </div>
  );
};

export default InfoField;
