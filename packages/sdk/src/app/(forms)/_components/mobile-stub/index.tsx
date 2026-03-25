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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import DefaultFolderDark from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.dark.svg";
import DefaultFolderLight from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.light.svg";

import styles from "./MobileStub.module.scss";

const MobileStub = () => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = isBase ? DefaultFolderLight : DefaultFolderDark;

  return (
    <div className={styles.mobileStub}>
      <div className={styles.icon}>
        {mounted ? <Icon /> : <div style={{ width: 200, height: 147 }} />}
      </div>
      <div className={styles.title}>{t("Common:FormsMobileStubTitle")}</div>
      <div className={styles.description}>
        {t("Common:FormsMobileStubDescription")}
      </div>
    </div>
  );
};

export default MobileStub;
