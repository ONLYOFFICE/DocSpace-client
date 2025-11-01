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
// trademark law for use of our trademarks.s
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useEffect, useState, useRef, RefObject } from "react";

import { Scrollbar as ScrollbarType } from "../../scrollbar/custom-scrollbar";

export const useViewTab = (
  containerRef: RefObject<ScrollbarType | null>,
  tabRef: RefObject<HTMLDivElement | null>,
  index: number,
) => {
  const [isViewTab, setIsViewTab] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver>(undefined);

  useEffect(() => {
    const container = containerRef.current?.scrollerElement;
    const trackedElement = tabRef.current?.children[index];
    if (!container || !trackedElement) return;

    const observerCallback: IntersectionObserverCallback = ([entry]) => {
      setIsViewTab(entry.isIntersecting);
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: container,
      rootMargin: "4px",
      threshold: 1,
    });

    observerRef.current.observe(trackedElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(trackedElement);
      }
    };
  }, [containerRef, index, tabRef]);

  return isViewTab;
};
