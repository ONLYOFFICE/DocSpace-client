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

import React from "react";
import classNames from "classnames";

import { Nullable } from "../../../../types";
import { useIsMobile } from "../../../../hooks/useIsMobile";

import { ChatContainerProps } from "../../Chat.types";
import styles from "./ChatContainer.module.scss";

const ChatContainer = ({ children }: ChatContainerProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  React.useEffect(() => {
    const scroll = isMobile
      ? document.querySelector("#customScrollBar .scroll-wrapper > .scroller")
      : document.querySelector("#sectionScroll .scroll-wrapper > .scroller");

    const mainBar = document.getElementById("main-bar");

    const lastStickyElement = isMobile
      ? document.querySelector(".section-sticky-container-mobile")
          ?.lastElementChild
      : document.querySelector(".section-sticky-container")?.lastElementChild;

    if (!scroll) return;

    let rafId: Nullable<number> = null;
    let currentHeaderTop: Nullable<number> = null;

    const calculateHeaderTop = () => {
      rafId = null;

      if (!containerRef.current) return;

      const mainBarHeight = isMobile ? 0 : mainBar?.clientHeight || 0;
      const newHeaderTop =
        (lastStickyElement?.getBoundingClientRect().bottom || 0) -
        mainBarHeight;

      if (currentHeaderTop === newHeaderTop) return;
      currentHeaderTop = newHeaderTop;

      containerRef.current.style.setProperty(
        "--chat-header-top",
        `${newHeaderTop}px`,
      );
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(calculateHeaderTop);
    };

    scroll.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      scroll.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className={classNames(styles.chatContainer, "chat-container")}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
