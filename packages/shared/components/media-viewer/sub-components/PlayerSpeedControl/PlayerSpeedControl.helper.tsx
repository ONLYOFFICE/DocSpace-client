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

import React from "react";

import Icon05x from "PUBLIC_DIR/images/media.viewer05x.react.svg";
import Icon1x from "PUBLIC_DIR/images/media.viewer1x.react.svg";
import Icon15x from "PUBLIC_DIR/images/media.viewer15x.react.svg";
import Icon2x from "PUBLIC_DIR/images/media.viewer2x.react.svg";

import { SpeedRecord, SpeedType } from "./PlayerSpeedControl.props";

export enum SpeedIndex {
  Speed_X05 = 0,
  Speed_X10 = 1,
  Speed_X15 = 2,
  Speed_X20 = 3,
}

export const speedIcons = [
  <Icon05x key="mediaviewer-speedIcon05x" />,
  <Icon1x key="mediaviewer-speedIcon10x" />,
  <Icon15x key="mediaviewer-speedIcon15x" />,
  <Icon2x key="mediaviewer-speedIcon20x" />,
];

export const speeds: SpeedType = ["X0.5", "X1", "X1.5", "X2"];

export const speedRecord: SpeedRecord<SpeedType> = {
  "X0.5": 0.5,
  X1: 1,
  "X1.5": 1.5,
  X2: 2,
};

export const DefaultIndexSpeed = SpeedIndex.Speed_X10;
export const MillisecondShowSpeedToast = 2000;

/**
 *The function returns the following index based on the logic from the layout
 *https://www.figma.com/file/T49yt13Eiu7nzvj4ymfssV/DocSpace-1.0.0?node-id=34536-418523&t=Yv2Rp3stGISIQNcm-0
 */
export const getNextIndexSpeed = (currentSpeedIndex: number) => {
  switch (currentSpeedIndex) {
    case SpeedIndex.Speed_X10:
      return SpeedIndex.Speed_X05;
    case SpeedIndex.Speed_X05:
      return SpeedIndex.Speed_X15;
    case SpeedIndex.Speed_X15:
      return SpeedIndex.Speed_X20;
    case SpeedIndex.Speed_X20:
      return SpeedIndex.Speed_X10;
    default:
      return DefaultIndexSpeed;
  }
};
