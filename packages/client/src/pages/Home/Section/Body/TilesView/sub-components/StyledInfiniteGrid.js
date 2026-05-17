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
import { InfiniteLoaderComponent } from "@docspace/ui-kit/components/infinite-loader";

import styles from "./StyledInfiniteGrid.module.scss";

const StyledCard = ({ cardHeight, children, className, ...rest }) => (
  <div
    className={`${styles.card}${className ? ` ${className}` : ""}`}
    style={{ height: `${cardHeight}px` }}
    {...rest}
  >
    {children}
  </div>
);

const StyledItem = ({ isRoom, isTemplate, children, className, ...rest }) => (
  <div
    className={`${styles.item}${className ? ` ${className}` : ""}`}
    data-is-room={isRoom || undefined}
    data-is-template={isTemplate || undefined}
    {...rest}
  >
    {children}
  </div>
);

const StyledHeaderItem = ({ children, className, ...rest }) => (
  <div
    className={`${styles.headerItem}${className ? ` ${className}` : ""}`}
    {...rest}
  >
    {children}
  </div>
);

const StyledInfiniteLoader = ({ className, ...props }) => (
  <InfiniteLoaderComponent
    className={`${styles.infiniteLoader}${className ? ` ${className}` : ""}`}
    {...props}
  />
);

export { StyledCard, StyledItem, StyledHeaderItem, StyledInfiniteLoader };
