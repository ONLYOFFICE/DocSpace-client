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

import { globalColors } from "@docspace/ui-kit/providers/theme";

/**
 * Configuration for the Login History campaign banner
 */
export const getLoginHistoryConfig = (
  isBaseTheme: boolean,
  isMobile: boolean = false,
  currentColorScheme?: {
    main?: { accent?: string | null; buttons?: string | null };
  } | null,
) => {
  const accentColor =
    currentColorScheme?.main?.accent || globalColors.lightBlueMain;

  return {
    borderColor: accentColor,
    title: {
      color: accentColor,
      fontSize: isMobile ? "12px" : "11px",
      lineHeight: isMobile ? "16px" : "12px",
      fontWeight: "600",
    },
    body: {
      fontSize: isMobile ? "14px" : "13px",
      lineHeight: isMobile ? "22px" : "20px",
      fontWeight: "600",
      color: isBaseTheme ? globalColors.black : globalColors.white,
    },
    text: {
      fontSize: isMobile ? "13px" : "12px",
      lineHeight: isMobile ? "20px" : "16px",
      fontWeight: "normal",
      color: isBaseTheme ? globalColors.grayText : globalColors.darkGrayDark,
    },
    action: {
      isButton: false,
      type: "2fa-settings",
    },
  };
};

export const loginHistoryConfig = getLoginHistoryConfig(true);
