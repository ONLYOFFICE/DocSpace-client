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

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDrag } from "@use-gesture/react";
import { useSpring, config, animated } from "@react-spring/web";

import ViewTilesIcon from "PUBLIC_DIR/images/view-tiles.react.svg";
import ViewRowsIcon from "PUBLIC_DIR/images/view-rows.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/12/cross.react.svg";
import classNames from "classnames";
import { Bookmarks } from "../Bookmarks";

import styles from "../../PDFViewer.module.scss";

import MobileDrawerProps from "./MobileDrawer.props";

export const MobileDrawer = ({
  bookmarks,
  isOpenMobileDrawer,
  navigate,
  resizePDFThumbnail,
  setIsOpenMobileDrawer,
}: MobileDrawerProps) => {
  const [height, setheight] = useState(window.innerHeight);

  const containerRef = useRef<HTMLDivElement>(null);

  const [style, api] = useSpring(() => ({ y: height, opacity: 1 }));

  const [toggle, setToggle] = useState<boolean>(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  const open = useCallback(
    (canceled = false, innerHeight?: number) => {
      api.start({
        y: (innerHeight ?? height) * 0.2,
        opacity: 1,
        immediate: false,
        config: canceled ? config.wobbly : config.stiff,
      });
    },
    [api, height],
  );

  const close = useCallback(
    (velocity = 0, innerHeight?: number) => {
      api.start({
        y: innerHeight ?? height,
        opacity: 0,
        immediate: false,
        config: { ...config.stiff, velocity },
      });
      setIsOpenMobileDrawer(false);
    },
    [api, height, setIsOpenMobileDrawer],
  );

  const handleResize = useCallback(() => {
    const { innerHeight } = window;

    setheight(innerHeight);
    if (isOpenMobileDrawer) {
      open(false, innerHeight);

      setTimeout(() => {
        resizePDFThumbnail();
      });
    } else close(0, innerHeight);
  }, [close, isOpenMobileDrawer, open, resizePDFThumbnail]);

  const bind = useDrag(
    ({
      last,
      velocity: [, vy],
      direction: [, dy],
      movement: [, my],
      cancel,
      canceled,
    }) => {
      if (my < -70) {
        cancel();
      }

      if (last) {
        if (my > height * 0.2 || (vy > 0.5 && dy > 0)) {
          close(vy);
        } else {
          open(canceled);
        }
      } else {
        api.start({
          y: my + height * 0.2,
          opacity: Math.max(1 - my / height, 0),
          immediate: true,
        });
      }
    },
    {
      from: () => [0, style.y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    },
  );

  const handleClickOutside = useCallback(
    (event: TouchEvent) => {
      if (
        isOpenMobileDrawer &&
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        close();
      }
    },
    [close, isOpenMobileDrawer],
  );

  const handleClose = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    close();
  };

  useEffect(() => {
    if (isOpenMobileDrawer) open();
  }, [isOpenMobileDrawer, open]);

  useEffect(() => {
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      // Unbind the event listener on clean up
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const visibility = isOpenMobileDrawer ? "visible" : "hidden";

  return (
    <section
      ref={containerRef}
      className={styles.container}
      aria-label="Mobile drawer"
      data-testid="mobile-drawer"
    >
      {/* @ts-expect-error - React Spring types issue with React 19 */}
      <animated.div
        className={styles.wrapper}
        style={{
          height,
          visibility,
          ...style,
        }}
        data-testid="mobile-drawer-content"
      >
        <div className={styles.header} {...bind()}>
          {bookmarks.length > 0
            ? React.createElement(toggle ? ViewTilesIcon : ViewRowsIcon, {
                onClick: handleToggle,
              })
            : null}
          <CrossIcon
            className="mobile-drawer_cross-icon"
            onClick={handleClose}
            aria-label="Close drawer"
            data-testid="close-drawer-button"
          />
        </div>
        <div style={{ height: height * 0.8 - 64 }} data-testid="drawer-content">
          {toggle ? (
            <Bookmarks bookmarks={bookmarks} navigate={navigate} />
          ) : null}
          <section
            id="viewer-thumbnail"
            className={classNames(styles.thumbnails, {
              [styles.visible]: !toggle,
            })}
          />
        </div>
      </animated.div>
    </section>
  );
};
