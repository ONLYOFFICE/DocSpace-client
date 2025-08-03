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

import { useState, useEffect } from "react";

import { MAX_INFINITE_LOADER_SHIFT, isMobile } from "../../utils/device";

import ListComponent from "./sub-components/List";
import GridComponent from "./sub-components/Grid";
import GridDynamicHeight from "./sub-components/GridDynamicHeight";

import { InfiniteLoaderProps } from "./InfiniteLoader.types";

const InfiniteLoaderComponent = (props: InfiniteLoaderProps) => {
  const { viewAs, isLoading } = props;

  const [scrollTop, setScrollTop] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const scroll =
    viewAs === "tileDynamicHeight"
      ? document.querySelector(
          "#scroll-templates-gallery .scroll-wrapper > .scroller",
        )
      : isMobile()
        ? document.querySelector("#customScrollBar .scroll-wrapper > .scroller")
        : document.querySelector("#sectionScroll .scroll-wrapper > .scroller");

  const onScroll = (e: Event) => {
    const eventTarget = e.target as HTMLElement;
    const currentScrollTop = eventTarget.scrollTop;

    setScrollTop(currentScrollTop ?? 0);

    const scrollShift = scrollTop - currentScrollTop;

    if (
      scrollShift > MAX_INFINITE_LOADER_SHIFT ||
      scrollShift < -MAX_INFINITE_LOADER_SHIFT
    ) {
      setShowSkeleton(true);
      setTimeout(() => {
        setShowSkeleton(false);
      }, 200);
    }
  };

  useEffect(() => {
    if (scroll) scroll.addEventListener("scroll", onScroll);

    return () => {
      if (scroll) scroll.removeEventListener("scroll", onScroll);
    };
  });

  if (isLoading) return null;

  console.log("scroll", scroll);

  return viewAs === "tileDynamicHeight" ? (
    <GridDynamicHeight
      scroll={scroll ?? window}
      showSkeleton={showSkeleton}
      {...props}
    />
  ) : viewAs === "tile" ? (
    <GridComponent
      scroll={scroll ?? window}
      showSkeleton={showSkeleton}
      {...props}
    />
  ) : (
    <ListComponent
      scroll={scroll ?? window}
      showSkeleton={showSkeleton}
      {...props}
    />
  );
};

export { InfiniteLoaderComponent };
