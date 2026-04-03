// (c) Copyright Ascensio System SIA 2009-2026
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
