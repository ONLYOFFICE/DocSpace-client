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

import { isNullOrUndefined } from "../../utils/typeGuards";

import { mapSupplied, mediaTypes } from "./MediaViewer.constants";
import type { BoundsType, PlaylistType, Point } from "./MediaViewer.types";

export const compareTo = (a: number, b: number) => {
  return Math.trunc(a) > Math.trunc(b);
};

export const getSizeByAngle = (
  width: number,
  height: number,
  angle: number,
): [number, number] => {
  const { abs, cos, sin, PI } = Math;

  const angleByRadians = (PI / 180) * angle;

  const c = cos(angleByRadians);
  const s = sin(angleByRadians);
  const halfw = 0.5 * width;
  const halfh = 0.5 * height;
  const newWidth = 2 * (abs(c * halfw) + abs(s * halfh));
  const newHeight = 2 * (abs(s * halfw) + abs(c * halfh));

  return [newWidth, newHeight];
};

export const getBounds = (
  image: HTMLImageElement | null,
  container: HTMLDivElement | null,
  diffScale: number = 1,
  angle: number = 0,
): BoundsType | null => {
  if (!image || !container) return null;

  let imageBounds = image.getBoundingClientRect();
  const containerBounds = container.getBoundingClientRect();

  const [width, height] = getSizeByAngle(
    imageBounds.width,
    imageBounds.height,
    angle,
  );

  if (diffScale !== 1)
    imageBounds = {
      ...imageBounds,
      width: width * diffScale,
      height: height * diffScale,
    };
  else {
    imageBounds = {
      ...imageBounds,
      width,
      height,
    };
  }
  const originalWidth = image.clientWidth;
  const widthOverhang = (imageBounds.width - originalWidth) / 2;

  const originalHeight = image.clientHeight;
  const heightOverhang = (imageBounds.height - originalHeight) / 2;

  const isWidthOutContainer = imageBounds.width >= containerBounds.width;

  const isHeightOutContainer = imageBounds.height >= containerBounds.height;

  const bounds = {
    right: isWidthOutContainer
      ? widthOverhang
      : containerBounds.width - imageBounds.width + widthOverhang,
    left: isWidthOutContainer
      ? -(imageBounds.width - containerBounds.width) + widthOverhang
      : widthOverhang,
    bottom: isHeightOutContainer
      ? heightOverhang
      : containerBounds.height - imageBounds.height + heightOverhang,
    top: isHeightOutContainer
      ? -(imageBounds.height - containerBounds.height) + heightOverhang
      : heightOverhang,
  };

  return bounds;
};

export const getImagePositionAndSize = (
  imageNaturalWidth: number,
  imageNaturalHeight: number,
  container: HTMLDivElement | null,
) => {
  if (!container) return null;

  const { width: containerWidth, height: containerHeight } =
    container.getBoundingClientRect();

  let width = Math.min(containerWidth, imageNaturalWidth);
  let height = (width / imageNaturalWidth) * imageNaturalHeight;

  if (height > containerHeight) {
    height = containerHeight;
    width = (height / imageNaturalHeight) * imageNaturalWidth;
  }
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;

  return { width, height, x, y };
};

export const calculateAdjustImageUtil = (
  element: HTMLElement | null,
  container: HTMLElement | null,
  pointProp: Point,
  diffScale: number = 1,
) => {
  if (!element || !container) return pointProp;

  const point = pointProp;

  // debugger;

  let imageBounds = element.getBoundingClientRect();
  const containerBounds = container.getBoundingClientRect();

  if (diffScale !== 1) {
    const { x, y, width, height } = imageBounds;

    const newWidth = imageBounds.width * diffScale;
    const newHeight = imageBounds.height * diffScale;

    const newX = x + width / 2 - newWidth / 2;
    const newY = y + height / 2 - newHeight / 2;

    imageBounds = {
      ...imageBounds,
      width: newWidth,
      height: newHeight,
      left: newX,
      top: newY,
      right: newX + newWidth,
      bottom: newY + newHeight,
      x: newX,
      y: newY,
    };
  }

  const originalWidth = element.clientWidth;
  const widthOverhang = (imageBounds.width - originalWidth) / 2;

  const originalHeight = element.clientHeight;
  const heightOverhang = (imageBounds.height - originalHeight) / 2;

  const isWidthOutContainer = imageBounds.width >= containerBounds.width;

  const isHeightOutContainer = imageBounds.height >= containerBounds.height;

  if (
    compareTo(imageBounds.left, containerBounds.left) &&
    isWidthOutContainer
  ) {
    point.x = widthOverhang;
  } else if (
    compareTo(containerBounds.right, imageBounds.right) &&
    isWidthOutContainer
  ) {
    point.x = containerBounds.width - imageBounds.width + widthOverhang;
  } else if (!isWidthOutContainer) {
    point.x = (containerBounds.width - imageBounds.width) / 2 + widthOverhang;
  }

  if (compareTo(imageBounds.top, containerBounds.top) && isHeightOutContainer) {
    point.y = heightOverhang;
  } else if (
    compareTo(containerBounds.bottom, imageBounds.bottom) &&
    isHeightOutContainer
  ) {
    point.y = containerBounds.height - imageBounds.height + heightOverhang;
  } else if (!isHeightOutContainer) {
    point.y =
      (containerBounds.height - imageBounds.height) / 2 + heightOverhang;
  }

  return point;
};

export const calculateAdjustBoundsUtils = (
  xProp: number,
  yProp: number,
  bounds: BoundsType | null,
): Point => {
  let x = xProp;
  let y = yProp;

  if (!bounds) return { x, y };

  const { left, right, top, bottom } = bounds;

  if (x > right) {
    x = right;
  } else if (x < left) {
    x = left;
  }

  if (y > bottom) {
    y = bottom;
  } else if (y < top) {
    y = top;
  }

  return { x, y };
};

export function isVideo(fileExst: string): boolean {
  return mapSupplied[fileExst]?.type === mediaTypes.video;
}

export const findNearestIndex = (
  items: PlaylistType[],
  index: number,
): number => {
  if (!Array.isArray(items) || items.length === 0 || index < 0) {
    return -1;
  }

  let found = items[0].id;

  items.forEach((item) => {
    if (Math.abs(item.id - index) < Math.abs(found - index)) {
      found = item.id;
    }
  });

  return found;
};

export const convertToTwoDigitString = (time: number): string => {
  return time < 10 ? `0${time}` : time.toString();
};

export const formatTime = (time: number): string => {
  if (isNullOrUndefined(time) || Number.isNaN(time) || time <= 0)
    return "00:00";

  const seconds: number = Math.floor(time % 60);
  const minutes: number = Math.floor(time / 60) % 60;
  const hours: number = Math.floor(time / 3600);

  const convertedHours = convertToTwoDigitString(hours);
  const convertedMinutes = convertToTwoDigitString(minutes);
  const convertedSeconds = convertToTwoDigitString(seconds);

  if (hours === 0) {
    return `${convertedMinutes}:${convertedSeconds}`;
  }
  return `${convertedHours}:${convertedMinutes}:${convertedSeconds}`;
};

export const isTiff = (extension: string) =>
  extension === ".tiff" || extension === ".tif";
export const isHeic = (extension: string) => extension === ".heic";
