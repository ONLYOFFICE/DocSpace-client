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
import React, { useEffect } from "react";

import DownloadingReactSvg from "PUBLIC_DIR/images/downloading.react.svg";
import DownloadingDarkReactSvg from "PUBLIC_DIR/images/downloading.dark.react.svg";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { OperationContainerProps } from "./OperationContainer.types";
import { Text } from "@docspace/ui-kit/components/text";
import PortalLogo from "@docspace/ui-kit/components/portal-logo/PortalLogo";

import styles from "./OperationContainer.module.scss";

const OperationContainer = (props: OperationContainerProps) => {
  const { url, authorized, title, description } = props;

  const { isBase } = useTheme();

  const logo = isBase ? (
    <DownloadingReactSvg
      className={styles.logo}
      data-testid="operation-logo"
      aria-hidden="true"
    />
  ) : (
    <DownloadingDarkReactSvg
      className={styles.logo}
      data-testid="operation-logo"
      aria-hidden="true"
    />
  );

  useEffect(() => {
    if (url && authorized) window.location.replace(url);
  }, [url, authorized]);

  return (
    <div
      className={styles.container}
      role="main"
      aria-label={title}
      data-testid="operation-container"
    >
      <PortalLogo isResizable data-testid="portal-logo" />
      {logo}
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.description}>{description}</Text>
    </div>
  );
};

export default OperationContainer;
