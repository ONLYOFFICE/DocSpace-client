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

import { useCallback } from "react";

import { HTML_EXST, EBOOK_EXST } from "../constants";
import { presentInArray } from "../utils";
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
