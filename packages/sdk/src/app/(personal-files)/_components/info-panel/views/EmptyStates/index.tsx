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

import { Text } from "@docspace/ui-kit/components/text";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.light.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.dark.svg?url";

import styles from "./EmptyStates.module.scss";

export const NoItem = () => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const imgSrc = isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl;

  return (
    <div className={styles.noItemContainer}>
      {/* biome-ignore lint/performance/noImgElement: static SVG via ?url import */}
      <img className={styles.image} src={imgSrc} alt="No item" />
      <Text className={styles.text}>{t("Common:FilesEmptyScreenText")}</Text>
    </div>
  );
};

export const SeveralItems = ({ count }: { count: number }) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const imgSrc = isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl;

  return (
    <div className={styles.severalItemsContainer}>
      {/* biome-ignore lint/performance/noImgElement: static SVG via ?url import */}
      <img className={styles.image} src={imgSrc} alt="Several items" />
      <Text fontSize="16px" fontWeight={700}>
        {`${t("Common:ItemsSelected")}: ${count}`}
      </Text>
    </div>
  );
};
