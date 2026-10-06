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

import { useState, useCallback, useEffect, useRef } from "react";
import { getCountTilesInRow } from "@docspace/shared/utils";

interface UseTemplateGalleryHotkeysProps {
  itemsCount: number;
  isShowOneTile?: boolean;
  onSelect?: (index: number) => void;
  onInfoSelect?: (index: number) => void;
  enabled?: boolean;
  resetKey?: unknown;
}

interface UseTemplateGalleryHotkeysReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  resetFocus: () => void;
}

const useTemplateGalleryHotkeys = ({
  itemsCount,
  isShowOneTile = false,
  onSelect,
  onInfoSelect,
  enabled = true,
  resetKey,
}: UseTemplateGalleryHotkeysProps): UseTemplateGalleryHotkeysReturn => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const focusedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  const getColumnsCount = useCallback(() => {
    return getCountTilesInRow(false, false, true, isShowOneTile);
  }, [isShowOneTile]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    focusedIndexRef.current = -1;
    pendingIndexRef.current = null;

    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    resetFocus();
  }, [resetKey, resetFocus]);

  const scrollToFocusedItem = useCallback((index: number) => {
    const scrollRoot = document.getElementById("scroll-template-gallery");
    if (!scrollRoot) return;

    const element = scrollRoot.querySelectorAll(".Card")[index] as
      | HTMLElement
      | undefined;
    if (!element) return;

    const scrollContainer = scrollRoot.querySelector(
      ".scroller",
    ) as HTMLElement | null;

    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    if (elementRect.top < containerRect.top) {
      scrollContainer.scrollTop += elementRect.top - containerRect.top;
    } else if (elementRect.bottom > containerRect.bottom) {
      scrollContainer.scrollTop += elementRect.bottom - containerRect.bottom;
    }
  }, []);

  const scheduleFocusUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;

      const nextIndex = pendingIndexRef.current;
      if (nextIndex === null) return;

      pendingIndexRef.current = null;
      focusedIndexRef.current = nextIndex;

      setFocusedIndex(nextIndex);
      scrollToFocusedItem(nextIndex);
    });
  }, [scrollToFocusedItem]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (itemsCount <= 0) {
      focusedIndexRef.current = -1;
      pendingIndexRef.current = null;
      setFocusedIndex(-1);
      return;
    }

    if (focusedIndexRef.current >= itemsCount) {
      const nextIndex = itemsCount - 1;
      focusedIndexRef.current = nextIndex;
      pendingIndexRef.current = null;
      setFocusedIndex(nextIndex);
    }
  }, [itemsCount]);

  useEffect(() => {
    if (!enabled || itemsCount === 0) return;

    const getIndexByPosition = (
      row: number,
      col: number,
      columnsCount: number,
    ) => {
      if (row < 0 || col < 0 || col >= columnsCount) return -1;

      const index = row * columnsCount + col;
      return index < itemsCount ? index : -1;
    };

    const moveFocus = (rowDelta: number, colDelta: number) => {
      const columnsCount = getColumnsCount();
      const currentIndex = pendingIndexRef.current ?? focusedIndexRef.current;

      let newIndex = 0;

      if (currentIndex !== -1) {
        const candidate = getIndexByPosition(
          Math.floor(currentIndex / columnsCount) + rowDelta,
          (currentIndex % columnsCount) + colDelta,
          columnsCount,
        );
        newIndex = candidate === -1 ? currentIndex : candidate;
      }

      pendingIndexRef.current = newIndex;
      scheduleFocusUpdate();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const currentIndex = pendingIndexRef.current ?? focusedIndexRef.current;
      const isFocusedValid = currentIndex >= 0 && currentIndex < itemsCount;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          moveFocus(1, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          moveFocus(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          moveFocus(0, 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          moveFocus(0, -1);
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (isFocusedValid) onSelect?.(currentIndex);
          break;
        case "i":
        case "I":
          e.preventDefault();
          e.stopPropagation();
          if (isFocusedValid) onInfoSelect?.(currentIndex);
          break;
        case "Home":
          e.preventDefault();
          e.stopPropagation();
          pendingIndexRef.current = 0;
          scheduleFocusUpdate();
          break;
        case "End":
          e.preventDefault();
          e.stopPropagation();
          pendingIndexRef.current = itemsCount - 1;
          scheduleFocusUpdate();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, {
      capture: true,
      passive: false,
    });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    };
  }, [
    enabled,
    itemsCount,
    getColumnsCount,
    scheduleFocusUpdate,
    onSelect,
    onInfoSelect,
  ]);

  return {
    focusedIndex,
    setFocusedIndex,
    resetFocus,
  };
};

export default useTemplateGalleryHotkeys;
