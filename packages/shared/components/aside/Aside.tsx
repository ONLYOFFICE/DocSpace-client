// (c) Copyright Ascensio System SIA 2009-2024
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
import { isMobileOnly, isIOS } from "react-device-detect";

import { Scrollbar } from "../scrollbar";

import {
  StyledAside,
  StyledControlContainer,
  StyledCrossIcon,
} from "./Aside.styled";
import { AsideProps } from "./Aside.types";

const AsidePure = (props: AsideProps) => {
  const {
    visible,
    children,
    scale = false,
    zIndex = 400,
    className,
    contentPaddingBottom,
    withoutBodyScroll = false,
    onClose,
  } = props;
  const [windowHeight] = React.useState(window.innerHeight);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const diffRef = React.useRef<number | null>(null);
  const visualPageTop = React.useRef(0);

  const onResize = React.useCallback(
    (e: Event) => {
      if (!contentRef.current) return;

      const target = e.target as VisualViewport;

      if (e?.type === "resize") {
        const diff = windowHeight - target.height - target.pageTop;

        visualPageTop.current = target.pageTop;

        contentRef.current.style.bottom = `${diff}px`;

        contentRef.current.style.height = `${
          target.height - 64 + target.pageTop
        }px`;

        contentRef.current.style.position = "fixed";

        diffRef.current = diff;
      } else if (e?.type === "scroll") {
        const diff = window.visualViewport?.pageTop ? 0 : visualPageTop.current;

        if (diffRef.current)
          contentRef.current.style.bottom = `${diffRef.current + diff}px`;

        if (window.visualViewport)
          contentRef.current.style.height = `${
            window.visualViewport.height - 64 + diff
          }px`;

        contentRef.current.style.position = "fixed";
      }
    },
    [windowHeight],
  );

  React.useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport?.addEventListener("resize", onResize);
      window.visualViewport?.addEventListener("scroll", onResize);
    }
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, [onResize]);

  return (
    <StyledAside
      visible={visible}
      scale={scale}
      zIndex={zIndex}
      contentPaddingBottom={contentPaddingBottom}
      className={`${className} not-selectable aside`}
      forwardRef={contentRef}
      data-testid="aside"
    >
      {/* <CloseButton  displayType="aside" zIndex={zIndex}/> */}
      {withoutBodyScroll ? children : <Scrollbar>{children}</Scrollbar>}

      {visible && (
        <StyledControlContainer className="close-button" onClick={onClose}>
          <StyledCrossIcon />
        </StyledControlContainer>
      )}
    </StyledAside>
  );
};

const Aside = React.memo(AsidePure);

export { Aside };
