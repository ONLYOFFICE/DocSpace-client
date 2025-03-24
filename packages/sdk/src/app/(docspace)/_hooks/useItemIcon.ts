import { useCallback } from "react";

import { HTML_EXST, EBOOK_EXST } from "@docspace/shared/constants";
import { presentInArray } from "@docspace/shared/utils";
import { TFilesSettings } from "@docspace/shared/api/files/types";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "@docspace/shared/utils/image-helpers";

export type TItemIconSizes = 24 | 32 | 64 | 96;

type UseItemIconProps = {
  filesSettings?: TFilesSettings;
};

export type TGetIcon = ReturnType<typeof useItemIcon>["getIcon"];

export default function useItemIcon({ filesSettings }: UseItemIconProps) {
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
