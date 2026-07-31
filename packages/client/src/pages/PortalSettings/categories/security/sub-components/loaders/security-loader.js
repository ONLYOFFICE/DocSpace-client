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

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./security-loader.module.scss";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

const SecurityLoader = () => {
  return (
    <div className={styles.loader}>
      <RectangleSkeleton className={styles.submenu} height="100%" />
      <div className={styles.header}>
        <RectangleSkeleton className={styles["header-item"]} height="28px" />
        <RectangleSkeleton className={styles["header-item"]} height="28px" />
        <RectangleSkeleton className={styles["header-item"]} height="28px" />
        <RectangleSkeleton className={styles["header-item"]} height="28px" />
      </div>
      <RectangleSkeleton className={styles.description} height="20px" />

      <div className={styles["password-settings"]}>
        <RectangleSkeleton className={styles.header} height="22px" />
        <RectangleSkeleton className={styles.subheader} height="16px" />
        <div className={styles.slider}>
          <RectangleSkeleton height="24px" width="160px" />
          <RectangleSkeleton height="20px" width="75px" />
        </div>
        <div className={styles.checkboxs}>
          <RectangleSkeleton height="20px" width="133px" />
          <RectangleSkeleton height="20px" width="83px" />
          <RectangleSkeleton height="20px" width="159px" />
        </div>
        <RectangleSkeleton className={styles.buttons} height="100%" />
      </div>

      <StyledSettingsSeparator />

      <div className={styles["tfa-settings"]}>
        <RectangleSkeleton className={styles.header} height="22px" />
        <div className={styles["radio-buttons"]}>
          <RectangleSkeleton height="20px" width="69px" />
          <RectangleSkeleton height="20px" width="69px" />
          <RectangleSkeleton height="20px" width="152px" />
        </div>
        <RectangleSkeleton className={styles.buttons} height="100%" />
      </div>

      <StyledSettingsSeparator />

      <div className={styles["domain-settings"]}>
        <RectangleSkeleton className={styles.header} height="22px" />
        <div className={styles["radio-buttons"]}>
          <RectangleSkeleton height="20px" width="77px" />
          <RectangleSkeleton height="20px" width="103px" />
          <RectangleSkeleton height="20px" width="127px" />
        </div>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <div className={styles.input}>
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <div className={styles.input}>
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <RectangleSkeleton className={styles.button} height="20px" />
        </div>
      </div>
    </div>
  );
};

export default SecurityLoader;
