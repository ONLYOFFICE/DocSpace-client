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

import type { EditorUser, TooltipDimensions } from "../EditorsTooltip.types";

const AVATAR_SIZE = 24;
const GAP_SIZE = 8;
const DESKTOP_ITEM_HEIGHT = 24;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DESKTOP_MAX_HEIGHT = 176;
const PADDING = 12;
const HEADER_HEIGHT = 25;

const MOBILE_ITEM_HEIGHT = 32;
const MOBILE_SCREEN_OFFSET = 107; // window height - 107px

/**
 * Calculates the width of text using canvas measureText
 */
export const calculateTextWidth = (text: string, font: string): number => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
};

/**
 * Calculates tooltip width based on editors list (desktop only)
 */
export const calculateTooltipWidth = (editors: EditorUser[]): number => {
  if (editors.length === 0) return MIN_WIDTH;

  // Calculate width based on longest name
  const font = "600 12px sans-serif"; // font-weight: 600, font-size: 12px
  const longestName = editors.reduce(
    (longest, editor) =>
      editor.name.length > longest.length ? editor.name : longest,
    "",
  );

  const textWidth = calculateTextWidth(longestName, font);
  // avatar + gap + text + padding
  const calculatedWidth = Math.ceil(
    AVATAR_SIZE + GAP_SIZE + textWidth + PADDING * 2,
  );

  return Math.max(MIN_WIDTH, Math.min(calculatedWidth, MAX_WIDTH));
};

/**
 * Calculates tooltip height based on editors count and item height
 */
export const calculateTooltipHeight = (
  editorsCount: number,
  itemHeight: number,
  maxHeight?: number,
): number => {
  if (editorsCount === 0) return 0;

  const itemsHeight =
    editorsCount * itemHeight + Math.max(0, editorsCount - 1) * GAP_SIZE;
  const calculatedHeight = HEADER_HEIGHT + itemsHeight;

  if (maxHeight !== undefined) {
    return Math.min(calculatedHeight, maxHeight);
  }

  return calculatedHeight;
};

/**
 * Calculates optimal dimensions for desktop tooltip
 */
export const calculateTooltipDimensions = (
  editors: EditorUser[],
): TooltipDimensions => {
  const width = calculateTooltipWidth(editors);

  const contentHeight = calculateTooltipHeight(
    editors.length,
    DESKTOP_ITEM_HEIGHT,
  );

  const maxContentHeight = DESKTOP_MAX_HEIGHT - PADDING * 2;
  const height = Math.min(contentHeight, maxContentHeight);

  return { width, height };
};

/**
 * Calculates height for mobile tooltip with screen height constraint
 */
export const calculateMobileTooltipHeight = (editors: EditorUser[]): number => {
  const maxContentHeight =
    window.innerHeight - MOBILE_SCREEN_OFFSET - PADDING * 2;

  return calculateTooltipHeight(
    editors.length,
    MOBILE_ITEM_HEIGHT,
    maxContentHeight,
  );
};
