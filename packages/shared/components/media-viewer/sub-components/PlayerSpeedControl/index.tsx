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
