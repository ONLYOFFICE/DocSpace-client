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

import React from "react";
import { Text } from "@docspace/ui-kit/components/text";
import { TTranslation } from "../../types";
import { RectangleSkeleton, CircleSkeleton } from "../index";
import styles from "./Share.module.scss";

export const RowSkeleton = () => {
  return (
    <div className={styles.row}>
      <CircleSkeleton x="16" y="16" radius="16" width="32" height="32" />
      <div className={styles.content}>
        <RectangleSkeleton width="161px" height="16px" />
        <RectangleSkeleton width="119px" height="16px" />
      </div>
      <div className={styles.actions}>
        <RectangleSkeleton width="16px" height="16px" />
        <RectangleSkeleton width="42px" height="28px" />
      </div>
    </div>
  );
};

interface ShareSkeletonProps {
  t: TTranslation;
}

const ShareSkeleton = ({ t }: ShareSkeletonProps) => {
  return (
    <div className={styles.wrapper}>
      <Text fontSize="14px" fontWeight={600} className={styles.titleLink}>
        {t("Common:SharedLinks")}
      </Text>
      <RowSkeleton />
      <div className={styles.title}>
        <RectangleSkeleton width="154px" height="16px" />
      </div>
      <RowSkeleton />
    </div>
  );
};

export default ShareSkeleton;
