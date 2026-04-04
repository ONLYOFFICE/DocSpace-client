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
