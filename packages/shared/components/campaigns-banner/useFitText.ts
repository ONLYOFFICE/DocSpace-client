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

import { useRef, useState, useEffect, useCallback } from "react";
import { ITranslate } from "./CampaignsBanner.types";

const MIN_FONT_SIZE = 9;
const FONT_STEP = 1;

const useFitText = (
  campaignBackground: string,
  campaignTranslate: ITranslate,
  currentFontSize: string = "13px",
) => {
  const ref: React.RefObject<HTMLDivElement | null> = useRef(null);
  const wrapperRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const initialFontSize = parseInt(currentFontSize, 10);

  const [fontSize, setFontSize] = useState(initialFontSize);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    setFontSize(initialFontSize);
    setIsCalculating(true);
  }, [campaignBackground, campaignTranslate, initialFontSize]);

  const checkOverflow = useCallback(() => {
    if (!ref.current || !wrapperRef.current || !isCalculating) return;

    const contentHeight = ref.current.scrollHeight;
    const containerHeight = wrapperRef.current.offsetHeight;
    const isOverflow = contentHeight > containerHeight;

    if (isOverflow && fontSize > MIN_FONT_SIZE) {
      setFontSize((prev) => Math.max(prev - FONT_STEP, MIN_FONT_SIZE));
    } else {
      setIsCalculating(false);
    }
  }, [fontSize, isCalculating]);

  useEffect(() => {
    if (isCalculating) {
      const rafId = requestAnimationFrame(checkOverflow);
      return () => cancelAnimationFrame(rafId);
    }
  }, [checkOverflow, isCalculating]);

  return { fontSize: `${fontSize}px`, ref, wrapperRef };
};

export default useFitText;
