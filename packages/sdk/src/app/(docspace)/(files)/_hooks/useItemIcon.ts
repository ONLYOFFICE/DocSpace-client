import { useCallback } from "react";

import { HTML_EXST, EBOOK_EXST } from "@docspace/shared/constants";
import { presentInArray } from "@docspace/shared/utils";
import { TFilesSettings } from "@docspace/shared/api/files/types";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";

type UseItemIconProps = {
  filesSettings: TFilesSettings;
};

export default function useItemIcon({ filesSettings }: UseItemIconProps) {
  const isArchive = useCallback(
    (extension: string) => presentInArray(filesSettings.extsArchive, extension),
    [filesSettings.extsArchive],
  );

  const isImage = useCallback(
    (extension: string) => presentInArray(filesSettings.extsImage, extension),
    [filesSettings.extsImage],
  );

  const isSound = useCallback(
    (extension: string) => presentInArray(filesSettings.extsAudio, extension),
    [filesSettings.extsAudio],
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
    (fileExst: string): string => {
      if (isArchive(fileExst)) return "archive.svg";
      if (isImage(fileExst)) return "image.svg";
      if (isSound(fileExst)) return "sound.svg";
      if (isHtml(fileExst)) return "html.svg";
      if (isEbook(fileExst)) return "ebook.svg";
      return `${fileExst.replace(/^\./, "")}.svg`;
    },
    [isArchive, isImage, isSound, isHtml, isEbook],
  );

  const getIcon = useCallback(
    (fileExst?: string) => {
      if (!fileExst) return iconSize32.get("folder.svg");

      const path = determineIconPath(fileExst);
      return iconSize32.has(path)
        ? (iconSize32.get(path) ?? "")
        : (iconSize32.get("file.svg") ?? "");
    },
    [determineIconPath],
  );

  return { getIcon };
}
