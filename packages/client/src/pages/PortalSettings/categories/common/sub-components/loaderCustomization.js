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

import { useState, useEffect } from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./loaderCustomization.module.scss";

const LoaderCustomization = (props) => {
  const {
    lngTZSettings,
    portalRenaming,
    welcomePage,
    dnsSettings,
    deepLink,
    adManagement,
    aiServicesManagement,
  } = props;
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);

  const checkInnerWidth = () => {
    if (window.innerWidth < 600) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }

    if (window.innerWidth <= 1024) {
      setIsDesktopView(true);
    } else {
      setIsDesktopView(false);
    }
  };

  useEffect(() => {
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    return () => window.removeEventListener("resize", checkInnerWidth);
  });

  const heightSaveCancelButtons = isDesktopView ? "40px" : "32px";
  const heightDnsDescription = isMobileView ? "40px" : "22px";

  const loaderStyle = {
    "--loader-header-display": dnsSettings ? "none" : "block",
    "--loader-header-width": lngTZSettings
      ? "283px"
      : welcomePage
        ? "201px"
        : portalRenaming
          ? "150px"
          : deepLink || adManagement || aiServicesManagement
            ? "250px"
            : "0",
    "--loader-title-width-mobile": portalRenaming ? "109px" : "61px",
    "--loader-title-width-tablet": lngTZSettings
      ? "61px"
      : welcomePage
        ? "28px"
        : portalRenaming
          ? "109px"
          : "0",
    "--loader-save-cancel-width-tablet": welcomePage ? "274px" : "197px",
    "--loader-save-cancel-width-desktop": welcomePage ? "264px" : "192px",
  };

  return (
    <div
      className={`${styles.loader} category-item-wrapper`}
      style={loaderStyle}
    >
      <RectangleSkeleton height="22px" className={styles.header} />

      {portalRenaming ? (
        <RectangleSkeleton height="80px" className={styles.description} />
      ) : null}

      {dnsSettings ? (
        <>
          <RectangleSkeleton
            className={styles.dnsDescription}
            height={heightDnsDescription}
          />
          <div className={styles.flex}>
            <RectangleSkeleton
              height="16px"
              width="16px"
              className={styles.paddingRight}
            />
            <RectangleSkeleton height="20px" width="135px" />
          </div>
          <RectangleSkeleton className={styles.dnsField} />
        </>
      ) : !deepLink && !adManagement && !aiServicesManagement ? (
        <>
          <RectangleSkeleton height="20px" className={styles.title} />
          <RectangleSkeleton height="32px" className={styles.comboBox} />
        </>
      ) : null}

      {deepLink || adManagement || aiServicesManagement ? (
        <>
          <RectangleSkeleton className={styles.description} />
          <div className={styles.checkboxs}>
            <RectangleSkeleton height="20px" />
            <RectangleSkeleton height="20px" />
          </div>
        </>
      ) : null}

      {lngTZSettings ? (
        <>
          <RectangleSkeleton height="20px" className={styles.titleLong} />
          <RectangleSkeleton height="32px" className={styles.comboBox} />
        </>
      ) : null}

      <RectangleSkeleton
        height={heightSaveCancelButtons}
        className={styles.saveCancelButtons}
      />
    </div>
  );
};

export default LoaderCustomization;
