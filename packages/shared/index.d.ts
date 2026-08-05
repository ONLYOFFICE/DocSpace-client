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

declare module "*.svg?url" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.ico" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  import React from "react";

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module "csvjson-json_beautifier" {
  export default function jsonBeautifier(
    json: string,
    options?: unknown,
  ): string;
}
declare module "react-values" {
  const StringValue: React.ReactNode;
  const BooleanValue: React.ReactNode;

  export { StringValue, BooleanValue };
}

declare module "resize-image" {
  type ImageFormat = "png" | "gif" | "bmp" | "jpeg" | "webp";

  type ImageTypes = {
    [P in Uppercase<ImageFormat>]: Lowercase<P>;
  };

  interface ResizeImage extends ImageTypes {
    resize2Canvas: (
      img: HTMLImageElement | ImageBitmap,
      width: number,
      height: number,
    ) => HTMLCanvasElement;
    resize: (
      img: HTMLImageElement | HTMLCanvasElement,
      width: number,
      height: number,
      type?: ImageFormat,
    ) => string;
  }

  const value: ResizeImage;
  export default value;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
