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

import { useRef, useState, useEffect, useCallback } from "react";

const MIN_FONT_SIZE = 9;
const FONT_STEP = 1;

const useFitText = (
  campaignBackground: string,
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
  }, [campaignBackground, initialFontSize]);

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
