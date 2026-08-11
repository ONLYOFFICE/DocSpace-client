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

import React from "react";

import { Text } from "@docspace/ui-kit/components/text";

import styles from "../Dashboard.module.scss";

export type ModuleItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  installed: boolean;
  href?: string;
};

type ModuleCardProps = {
  mod: ModuleItem;
  onClick: () => void;
};

export const ModuleCard = ({ mod, onClick }: ModuleCardProps) => {
  return (
    // The dashboard tour lights up every app card as one region, and it measures
    // the union of the elements its step names one selector at a time — so each
    // card is addressable on its own (`dashboard-app-card-{id}`) rather than all
    // of them sharing one value. A shared value would resolve to the first card
    // alone and spotlight only Files.
    //
    // On the cards rather than on the grid around them, so the section heading
    // above stays outside the spotlight.
    <button
      type="button"
      data-tour-id={`dashboard-app-card-${mod.id}`}
      className={styles.moduleCard}
      onClick={onClick}
    >
      <div className={styles.moduleHeader}>
        <span className={styles.moduleIcon} data-installed={mod.installed}>
          {mod.icon}
        </span>
        <Text as="p" className={styles.moduleTitle}>
          {mod.title}
        </Text>
      </div>
      <Text as="p" className={styles.moduleDescription}>
        {mod.description}
      </Text>
    </button>
  );
};

