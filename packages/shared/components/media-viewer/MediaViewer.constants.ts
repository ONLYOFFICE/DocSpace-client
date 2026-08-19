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

export const mediaTypes = Object.freeze({
  audio: 1,
  video: 2,
  pdf: 3,
});

export const mapSupplied: Readonly<
  Record<string, { supply: string; type: number; convertable?: boolean }>
> = Object.freeze({
  ".aac": { supply: "m4a", type: mediaTypes.audio },
  ".flac": { supply: "mp3", type: mediaTypes.audio },
  ".m4a": { supply: "m4a", type: mediaTypes.audio },
  ".mp3": { supply: "mp3", type: mediaTypes.audio },
  ".oga": { supply: "oga", type: mediaTypes.audio },
  ".ogg": { supply: "oga", type: mediaTypes.audio },
  ".wav": { supply: "wav", type: mediaTypes.audio },

  ".f4v": { supply: "m4v", type: mediaTypes.video },
  ".m4v": { supply: "m4v", type: mediaTypes.video },
  ".mov": { supply: "m4v", type: mediaTypes.video },
  ".mp4": { supply: "m4v", type: mediaTypes.video },
  ".ogv": { supply: "ogv", type: mediaTypes.video },
  ".webm": { supply: "webmv", type: mediaTypes.video },
  ".wmv": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".avi": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".mpeg": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".mpg": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".pdf": { supply: "pdf", type: mediaTypes.pdf },
});
