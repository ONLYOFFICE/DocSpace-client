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

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./loaderCustomizationNavbar.module.scss";

const LoaderCustomizationNavbar = () => {
  return (
    <div>
      <div className={styles.section}>
        <RectangleSkeleton height="22px" className={styles.titleLong} />
        <RectangleSkeleton
          height="80px"
          className={`${styles.width} ${styles.paddingBottom}`}
        />
        <RectangleSkeleton height="20px" width="73px" />
      </div>

      <div className={styles.section}>
        <RectangleSkeleton
          height="22px"
          width="201px"
          className={`${styles.paddingBottom} ${styles.display}`}
        />
        <RectangleSkeleton height="80px" className={styles.width} />
      </div>

      <div className={styles.section}>
        <RectangleSkeleton
          height="22px"
          width="119px"
          className={styles.paddingTop}
        />
        <RectangleSkeleton height="40px" className={styles.width} />
        <RectangleSkeleton
          height="20px"
          width="73px"
          className={`${styles.width} ${styles.paddingTop}`}
        />
      </div>

      <div className={styles.section}>
        <RectangleSkeleton
          height="22px"
          width="150px"
          className={`${styles.paddingBottom} ${styles.display}`}
        />
        <RectangleSkeleton
          height="20px"
          width="253px"
          className={styles.paddingTop}
        />
      </div>
    </div>
  );
};

export default LoaderCustomizationNavbar;
