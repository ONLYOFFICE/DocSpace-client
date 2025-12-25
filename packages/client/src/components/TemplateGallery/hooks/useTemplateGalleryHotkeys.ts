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

import { useState, useCallback, useEffect, useRef } from "react";
import { getCountTilesInRow } from "@docspace/shared/utils";

interface UseTemplateGalleryHotkeysProps {
  itemsCount: number;
  isShowOneTile?: boolean;
  onSelect?: (index: number) => void;
  onInfoSelect?: (index: number) => void;
  enabled?: boolean;
  resetKey?: unknown;
  hasSubmitTile?: boolean;
  submitTileSpan?: number;
}

interface UseTemplateGalleryHotkeysReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  resetFocus: () => void;
  isSubmitTileFocused: boolean;
}

const useTemplateGalleryHotkeys = ({
  itemsCount,
  isShowOneTile = false,
  onSelect,
  onInfoSelect,
  enabled = true,
  resetKey,
  hasSubmitTile = false,
  submitTileSpan = 1,
}: UseTemplateGalleryHotkeysProps): UseTemplateGalleryHotkeysReturn => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [rawFocusedIndex, setRawFocusedIndex] = useState<number>(-1);
  const focusedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const pendingIndexRef = useRef<number | null>(null);
  const hasSubmitTileRef = useRef<boolean>(hasSubmitTile);
  const submitTileSpanRef = useRef<number>(submitTileSpan);

  const getColumnsCount = useCallback(() => {
    return getCountTilesInRow(false, false, true, isShowOneTile);
  }, [isShowOneTile]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
    setRawFocusedIndex(-1);
  }, []);

  useEffect(() => {
    hasSubmitTileRef.current = hasSubmitTile;
  }, [hasSubmitTile]);

  useEffect(() => {
    submitTileSpanRef.current = submitTileSpan;
  }, [submitTileSpan]);

  const getSubmitSpan = useCallback((columnsCount: number) => {
    if (!hasSubmitTileRef.current) return 1;
    const span = submitTileSpanRef.current || 1;
    return Math.max(1, Math.min(span, columnsCount));
  }, []);

  const getPositionByRawIndex = useCallback(
    (rawIndex: number, columnsCount: number) => {
      if (rawIndex < 0) return { row: -1, col: -1 };

      if (!hasSubmitTileRef.current) {
        return {
          row: Math.floor(rawIndex / columnsCount),
          col: rawIndex % columnsCount,
        };
      }

      const span = getSubmitSpan(columnsCount);
      const firstRowCount = columnsCount - span + 1;

      if (rawIndex === 0) return { row: 0, col: 0 };

      if (rawIndex < firstRowCount) {
        return { row: 0, col: span + (rawIndex - 1) };
      }

      const offset = rawIndex - firstRowCount;
      return {
        row: 1 + Math.floor(offset / columnsCount),
        col: offset % columnsCount,
      };
    },
    [getSubmitSpan],
  );

  const getRawIndexByPosition = useCallback(
    (row: number, col: number, columnsCount: number, totalCount: number) => {
      if (row < 0 || col < 0 || col >= columnsCount) return -1;

      let rawIndex = -1;

      if (!hasSubmitTileRef.current) {
        rawIndex = row * columnsCount + col;
      } else {
        const span = getSubmitSpan(columnsCount);
        const firstRowCount = columnsCount - span + 1;

        if (row === 0) {
          rawIndex = col < span ? 0 : 1 + (col - span);
        } else {
          rawIndex = firstRowCount + (row - 1) * columnsCount + col;
        }
      }

      if (rawIndex < 0 || rawIndex >= totalCount) return -1;
      return rawIndex;
    },
    [getSubmitSpan],
  );

  const getTotalCount = useCallback(() => {
    return itemsCount + (hasSubmitTileRef.current ? 1 : 0);
  }, [itemsCount]);

  const rawToFileIndex = useCallback((rawIndex: number) => {
    if (rawIndex < 0) return -1;
    if (hasSubmitTileRef.current) return rawIndex === 0 ? -1 : rawIndex - 1;
    return rawIndex;
  }, []);

  const getSubmitButton = useCallback(() => {
    const scrollRoot = document.getElementById("scroll-template-gallery");
    return scrollRoot?.querySelector(
      '[data-submit-tile="true"] button',
    ) as HTMLButtonElement | null;
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

  const scrollToFocusedItem = useCallback((rawIndex: number) => {
    const scrollRoot = document.getElementById("scroll-template-gallery");
    if (!scrollRoot) return;

    const fileIndex = rawToFileIndex(rawIndex);

    let element: HTMLElement | null = null;
    if (fileIndex === -1 && hasSubmitTileRef.current) {
      element = scrollRoot.querySelector(
        '[data-submit-tile="true"]',
      ) as HTMLElement | null;
    } else {
      const cards = scrollRoot.querySelectorAll(".Card");

      const submitTileElement = scrollRoot.querySelector(
        '[data-submit-tile="true"]',
      ) as HTMLElement | null;
      const submitTileCard = submitTileElement?.closest(
        ".Card",
      ) as HTMLElement | null;

      const submitCardOffset = submitTileCard ? 1 : 0;
      const cardIndex = fileIndex + submitCardOffset;

      if (!cards[cardIndex]) return;
      element = cards[cardIndex] as HTMLElement;
    }

    if (!element) return;

    const scrollContainer = scrollRoot?.querySelector(
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

      const nextFileIndex = rawToFileIndex(nextIndex);
      setFocusedIndex(nextFileIndex);
      setRawFocusedIndex(nextIndex);
      scrollToFocusedItem(nextIndex);

      if (hasSubmitTileRef.current && nextIndex === 0) {
        getSubmitButton()?.focus();
      }
    });
  }, [getSubmitButton, rawToFileIndex, scrollToFocusedItem]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
    const totalCount = getTotalCount();
    if (totalCount <= 0) {
      focusedIndexRef.current = -1;
      pendingIndexRef.current = null;
      setFocusedIndex(-1);
      setRawFocusedIndex(-1);
      return;
    }

    const currentRaw = focusedIndexRef.current;
    if (currentRaw >= totalCount) {
      const nextRaw = totalCount - 1;
      focusedIndexRef.current = nextRaw;
      pendingIndexRef.current = null;
      setFocusedIndex(rawToFileIndex(nextRaw));
      setRawFocusedIndex(nextRaw);
    }
  }, [getTotalCount, itemsCount, rawToFileIndex, hasSubmitTile]);

  useEffect(() => {
    if (!enabled || itemsCount === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const columnsCount = getColumnsCount();
      const totalCount = getTotalCount();
      const currentIndex = pendingIndexRef.current ?? focusedIndexRef.current;

      const currentPos = getPositionByRawIndex(currentIndex, columnsCount);

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          e.stopPropagation();
          let newIndex = 0;

          if (currentIndex === -1) {
            newIndex = 0;
          } else {
            const candidate = getRawIndexByPosition(
              currentPos.row + 1,
              currentPos.col,
              columnsCount,
              totalCount,
            );
            newIndex = candidate === -1 ? currentIndex : candidate;
          }

          pendingIndexRef.current = newIndex;
          scheduleFocusUpdate();

          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          e.stopPropagation();
          let newIndex = 0;

          if (currentIndex === -1) {
            newIndex = 0;
          } else {
            const candidate = getRawIndexByPosition(
              currentPos.row - 1,
              currentPos.col,
              columnsCount,
              totalCount,
            );
            newIndex = candidate === -1 ? currentIndex : candidate;
          }

          pendingIndexRef.current = newIndex;
          scheduleFocusUpdate();

          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          e.stopPropagation();
          let newIndex = 0;

          if (currentIndex === -1) {
            newIndex = 0;
          } else {
            const step =
              hasSubmitTileRef.current && currentIndex === 0
                ? getSubmitSpan(columnsCount)
                : 1;

            const candidate = getRawIndexByPosition(
              currentPos.row,
              currentPos.col + step,
              columnsCount,
              totalCount,
            );

            newIndex = candidate === -1 ? currentIndex : candidate;
          }

          pendingIndexRef.current = newIndex;
          scheduleFocusUpdate();

          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          e.stopPropagation();
          let newIndex = 0;

          if (currentIndex === -1) {
            newIndex = 0;
          } else {
            const candidate = getRawIndexByPosition(
              currentPos.row,
              currentPos.col - 1,
              columnsCount,
              totalCount,
            );

            newIndex = candidate === -1 ? currentIndex : candidate;
          }

          pendingIndexRef.current = newIndex;
          scheduleFocusUpdate();

          break;
        }
        case "Enter": {
          e.preventDefault();
          e.stopPropagation();
          if (hasSubmitTileRef.current && currentIndex === 0) {
            getSubmitButton()?.click();
            return;
          }

          const fileIndex = rawToFileIndex(currentIndex);
          if (fileIndex >= 0 && fileIndex < itemsCount) {
            onSelect?.(fileIndex);
          }
          break;
        }
        case "i":
        case "I": {
          e.preventDefault();
          e.stopPropagation();

          const fileIndex = rawToFileIndex(currentIndex);
          if (fileIndex >= 0 && fileIndex < itemsCount) {
            onInfoSelect?.(fileIndex);
          }

          break;
        }
        case "Home": {
          e.preventDefault();
          e.stopPropagation();
          pendingIndexRef.current = 0;
          scheduleFocusUpdate();

          break;
        }
        case "End": {
          e.preventDefault();
          e.stopPropagation();
          const lastIndex = totalCount - 1;
          pendingIndexRef.current = lastIndex >= 0 ? lastIndex : 0;
          scheduleFocusUpdate();

          break;
        }
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
    getTotalCount,
    getPositionByRawIndex,
    getRawIndexByPosition,
    getSubmitSpan,
    scheduleFocusUpdate,
    onSelect,
    onInfoSelect,
    rawToFileIndex,
    getSubmitButton,
  ]);

  return {
    focusedIndex,
    setFocusedIndex,
    resetFocus,
    isSubmitTileFocused: hasSubmitTile && rawFocusedIndex === 0,
  };
};

export default useTemplateGalleryHotkeys;
