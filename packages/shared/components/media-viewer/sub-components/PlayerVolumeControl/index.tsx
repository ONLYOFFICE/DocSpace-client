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

import React, { memo } from "react";

import IconVolumeMax from "PUBLIC_DIR/images/media.volumemax.react.svg";
import IconVolumeMuted from "PUBLIC_DIR/images/media.volumeoff.react.svg";
import IconVolumeMin from "PUBLIC_DIR/images/media.volumemin.react.svg";

import styles from "./PlayerVolumeControl.module.scss";

type PlayerVolumeControlProps = {
  volume: number;
  isMuted: boolean;
  toggleVolumeMute: VoidFunction;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const PlayerVolumeControl = memo(
  ({
    volume,
    isMuted,
    onChange,
    toggleVolumeMute,
  }: PlayerVolumeControlProps) => {
    return (
      <div
        className={styles.playerVolumeControlWrapper}
        data-testid="player-volume-control"
        role="group"
        aria-label="Volume controls"
      >
        <div
          className={styles.iconWrapper}
          onClick={toggleVolumeMute}
          data-testid="volume-mute-button"
          aria-label={isMuted ? "Unmute" : "Mute"}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            <IconVolumeMuted />
          ) : volume >= 50 ? (
            <IconVolumeMax />
          ) : (
            <IconVolumeMin />
          )}
        </div>
        <div
          className={styles.volumeWrapper}
          data-testid="volume-slider-wrapper"
        >
          <input
            style={{
              backgroundSize: `${volume}% 100%`,
            }}
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={onChange}
            data-testid="volume-slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volume}
            aria-valuetext={`${volume}%`}
          />
        </div>
      </div>
    );
  },
);

PlayerVolumeControl.displayName = "PlayerVolumeControl";

export { PlayerVolumeControl };
