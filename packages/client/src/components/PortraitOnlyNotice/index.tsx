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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import styles from "./PortraitOnlyNotice.module.scss";

const isLandscapeScreen = () => {
  const type = window.screen?.orientation?.type;
  if (type) return type.startsWith("landscape");

  return Math.abs(Number(window.orientation)) === 90;
};

const PortraitOnlyNotice = () => {
  const { t } = useTranslation(["Common"]);
  const [isLandscape, setIsLandscape] = useState(
    () => isMobileOnly && isLandscapeScreen(),
  );

  useEffect(() => {
    if (!isMobileOnly) return;

    const update = () => setIsLandscape(isLandscapeScreen());

    window.screen?.orientation?.addEventListener?.("change", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);

    return () => {
      window.screen?.orientation?.removeEventListener?.("change", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div
      className={styles.notice}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="portrait-only-notice-title"
      data-testid="portrait-only-notice"
    >
      <svg
        className={styles.icon}
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
        <path d="M10 6L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p id="portrait-only-notice-title" className={styles.title}>
        {t("Common:RotateToPortraitTitle")}
      </p>
      <p className={styles.text}>{t("Common:RotateToPortraitText")}</p>
    </div>
  );
};

export default PortraitOnlyNotice;
