// (c) Copyright Ascensio System SIA 2009-2025
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
import React, { useEffect } from "react";

import DownloadingReactSvg from "PUBLIC_DIR/images/downloading.react.svg";
import DownloadingDarkReactSvg from "PUBLIC_DIR/images/downloading.dark.react.svg";

import { useTheme } from "../../hooks/useTheme";

import { OperationContainerProps } from "./OperationContainer.types";
import { Text } from "../text";
import PortalLogo from "../portal-logo/PortalLogo";

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
