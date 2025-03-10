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
