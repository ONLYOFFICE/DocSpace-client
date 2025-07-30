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

import React, { memo, useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import styles from "./PlayerSpeedControl.module.scss";

import { PlayerSpeedControlProps } from "./PlayerSpeedControl.props";

import {
  DefaultIndexSpeed,
  getNextIndexSpeed,
  MillisecondShowSpeedToast,
  speedIcons,
  speedRecord,
  speeds,
} from "./PlayerSpeedControl.helper";

const PlayerSpeedControl = memo(
  ({ handleSpeedChange, onMouseLeave, src }: PlayerSpeedControlProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout>(undefined);

    const [currentIndexSpeed, setCurrentIndexSpeed] =
      useState<number>(DefaultIndexSpeed);
    const [isOpenSpeedContextMenu, setIsOpenSpeedContextMenu] =
      useState<boolean>(false);
    const [speedToastVisible, setSpeedToastVisible] = useState<boolean>(false);

    useEffect(() => {
      setCurrentIndexSpeed(DefaultIndexSpeed);
    }, [src]);

    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }
        setIsOpenSpeedContextMenu(false);
      };
      document.addEventListener("mousedown", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        clearTimeout(timerRef.current);
      };
    }, []);

    const toggle = () => {
      if (isMobileOnly) {
        const nextIndexSpeed = getNextIndexSpeed(currentIndexSpeed);
        setCurrentIndexSpeed(nextIndexSpeed);
        const newSpeed = speedRecord[speeds[nextIndexSpeed]];
        handleSpeedChange(newSpeed);
        setSpeedToastVisible(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setSpeedToastVisible(false);
        }, MillisecondShowSpeedToast);
      } else {
        setIsOpenSpeedContextMenu((prev) => !prev);
      }
    };

    return (
      <>
        {speedToastVisible ? (
          <div className={styles.toast}>{speedIcons[currentIndexSpeed]}</div>
        ) : null}
        <div
          className={styles.wrapper}
          ref={ref}
          onClick={toggle}
          data-testid="speed-control"
          aria-expanded={isOpenSpeedContextMenu}
          aria-haspopup="listbox"
        >
          {speedIcons[currentIndexSpeed]}

          {isOpenSpeedContextMenu ? (
            <div
              className={styles.dropdown}
              onMouseLeave={onMouseLeave}
              data-testid="speed-menu"
              aria-label="Select playback speed"
            >
              {speeds.map((speed, index) => (
                <div
                  key={speed}
                  className={styles.dropdownItem}
                  data-testid={`speed-option-${speed}`}
                  aria-selected={index === currentIndexSpeed}
                  onClick={() => {
                    setCurrentIndexSpeed(index);
                    handleSpeedChange(speedRecord[speed]);
                    onMouseLeave();
                  }}
                >
                  {speed}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  },
);

PlayerSpeedControl.displayName = "PlayerSpeedControl";

export { PlayerSpeedControl };
