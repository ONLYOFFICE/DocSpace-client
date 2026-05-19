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

import { useCallback } from "react";

import { HTML_EXST, EBOOK_EXST } from "../constants";
import { presentInArray } from "../utils/presentInArray";
import { TFilesSettings } from "../api/files/types";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "../utils/image-helpers";

export type TItemIconSizes = 24 | 32 | 64 | 96;

type UseItemIconProps = {
  filesSettings?: TFilesSettings;
};

export type TGetIcon = ReturnType<typeof useItemIcon>["getIcon"];

export function useItemIcon({ filesSettings }: UseItemIconProps) {
  const isArchive = useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsArchive ?? [], extension),
    [filesSettings?.extsArchive],
  );

  const isImage = useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsImage ?? [], extension),
    [filesSettings?.extsImage],
  );

  const isSound = useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsAudio ?? [], extension),
    [filesSettings?.extsAudio],
  );

  const isHtml = useCallback(
    (extension: string) => presentInArray(HTML_EXST, extension),
    [],
  );

  const isEbook = useCallback(
    (extension: string) => presentInArray(EBOOK_EXST, extension),
    [],
  );

  const determineIconPath = useCallback(
    (fileExst: string = ""): string => {
      if (isArchive(fileExst)) return "archive.svg";
      if (isImage(fileExst)) return "image.svg";
      if (isSound(fileExst)) return "sound.svg";
      if (isHtml(fileExst)) return "html.svg";
      if (isEbook(fileExst)) return "ebook.svg";
      return `${fileExst.replace(/^\./, "")}.svg`;
    },
    [isArchive, isImage, isSound, isHtml, isEbook],
  );

  const getIconBySize = useCallback((path: string, size = 32) => {
    const getOrDefault = (container: Map<string, string>) => {
      const icon = container.has(path)
        ? container.get(path)
        : container.get("file.svg");

      return icon ?? "";
    };

    switch (+size) {
      case 24:
        return getOrDefault(iconSize24);
      case 32:
        return getOrDefault(iconSize32);
      case 64:
        return getOrDefault(iconSize64);
      case 96:
        return getOrDefault(iconSize96);
      default:
        return getOrDefault(iconSize32);
    }
  }, []);

  const getIcon = useCallback(
    (fileExst?: string, size: TItemIconSizes = 32, contentLength?: string) => {
      if (!fileExst && !contentLength) return getIconBySize("folder.svg", size);

      const path = determineIconPath(fileExst);
      return getIconBySize(path, size);
    },
    [determineIconPath, getIconBySize],
  );

  return { getIcon };
}
