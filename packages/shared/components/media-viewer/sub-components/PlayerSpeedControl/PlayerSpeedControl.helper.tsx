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
