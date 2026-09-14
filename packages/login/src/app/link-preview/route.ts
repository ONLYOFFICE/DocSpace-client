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

import sharp from "sharp";

import { WhiteLabelLogoType } from "@docspace/ui-kit/enums";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import {
  LINK_PREVIEW_IMAGE_HEIGHT,
  LINK_PREVIEW_IMAGE_TYPE,
  LINK_PREVIEW_IMAGE_WIDTH,
} from "@docspace/shared/utils/link-preview";

import { logger } from "@/../logger.mjs";

const WIDTH = Number(LINK_PREVIEW_IMAGE_WIDTH);
const HEIGHT = Number(LINK_PREVIEW_IMAGE_HEIGHT);
const LOGO_WIDTH = 760;
const LOGO_DENSITY = 450;
const CACHE_CONTROL = "public, max-age=3600";
const BACKGROUND = { r: 255, g: 255, b: 255 };

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = process.env.API_HOST?.trim() || (await getBaseUrl());

  try {
    const response = await fetch(
      `${origin}/logo.ashx?logotype=${WhiteLabelLogoType.LoginPage}`,
    );

    if (!response.ok)
      throw new Error(`logo request failed with ${response.status}`);

    const logo = Buffer.from(await response.arrayBuffer());

    const rendered = await sharp(logo, { density: LOGO_DENSITY })
      .resize({ width: LOGO_WIDTH, fit: "inside" })
      .png()
      .toBuffer();

    const { width = 0, height = 0 } = await sharp(rendered).metadata();

    const image = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: BACKGROUND,
      },
    })
      .composite([
        {
          input: rendered,
          left: Math.round((WIDTH - width) / 2),
          top: Math.round((HEIGHT - height) / 2),
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new Response(new Uint8Array(image), {
      headers: {
        "content-type": LINK_PREVIEW_IMAGE_TYPE,
        "content-length": String(image.length),
        "cache-control": CACHE_CONTROL,
      },
    });
  } catch (error) {
    logger.error(`link preview image generation failed: ${error}`);

    return new Response(null, { status: 404 });
  }
}
