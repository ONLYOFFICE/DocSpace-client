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

import { Row } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";
import styles from "./HotkeysPanel.module.scss";

const SelectionBlock = ({ t, textStyles, keyTextStyles, CtrlKey, AltKey }) => {
  return (
    <>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectItem")}</Text>
          <Text {...keyTextStyles}>x</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectDown")}</Text>
          <Text {...keyTextStyles}>j {t("Common:Or")} ↓</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectUp")}</Text>
          <Text {...keyTextStyles}>k {t("Common:Or")} ↑</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectLeft")}</Text>
          <Text {...keyTextStyles}>h {t("Common:Or")} ←</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectRight")}</Text>
          <Text {...keyTextStyles}>l {t("Common:Or")} →</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysExtendSelectionDown")}</Text>
          <Text {...keyTextStyles}>Shift + ↓</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysExtendSelectionUp")}</Text>
          <Text {...keyTextStyles}>Shift + ↑</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysExtendSelectionLeft")}</Text>
          <Text {...keyTextStyles}>Shift + ←</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysExtendSelectionRight")}</Text>
          <Text {...keyTextStyles}>Shift + →</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysSelectAll")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + a</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysClearAll")}</Text>
          <Text {...keyTextStyles}>Shift + n {t("Common:Or")} Esc</Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysDisablesSelectionArea")}</Text>
          <Text {...keyTextStyles}>
            {CtrlKey} + {AltKey}
          </Text>
        </>
      </Row>
      <Row className={styles.hotkeysRow}>
        <>
          <Text {...textStyles}>{t("HotkeysCopySelectedItems")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + Shift + c</Text>
        </>
      </Row>
    </>
  );
};

export default SelectionBlock;
