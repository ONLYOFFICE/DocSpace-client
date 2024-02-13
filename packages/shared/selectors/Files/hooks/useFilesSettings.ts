import React from "react";
import { TFilesSettings } from "../../../api/files/types";
import { getSettingsFiles } from "../../../api/files";
import { presentInArray } from "../../../utils";
import { iconSize32 } from "../../../utils/image-helpers";
import { HTML_EXST } from "../../../constants";

const useFilesSettings = (
  getIconProp?: (size: number, fileExst: string) => string,
) => {
  const [settings, setSettings] = React.useState({} as TFilesSettings);

  const requestRunning = React.useRef(false);

  const initSettings = React.useCallback(async () => {
    if (requestRunning.current) return;

    requestRunning.current = true;
    if (getIconProp) return;
    const res = await getSettingsFiles();

    setSettings(res);
    requestRunning.current = false;
  }, [getIconProp]);

  React.useEffect(() => {
    if (settings.extsArchive) return;
    initSettings();
  }, [initSettings, settings.extsArchive]);

  const isArchive = React.useCallback(
    (extension: string) => presentInArray(settings.extsArchive, extension),
    [settings.extsArchive],
  );

  const isImage = React.useCallback(
    (extension: string) => presentInArray(settings.extsImage, extension),
    [settings.extsImage],
  );

  const isSound = React.useCallback(
    (extension: string) => presentInArray(settings.extsAudio, extension),
    [settings.extsAudio],
  );

  const isHtml = React.useCallback(
    (extension: string) => presentInArray(HTML_EXST, extension),
    [],
  );

  const getIcon = React.useCallback(
    (fileExst: string) => {
      if (getIconProp) return getIconProp(32, fileExst);

      const isArchiveItem = isArchive(fileExst);
      const isImageItem = isImage(fileExst);
      const isSoundItem = isSound(fileExst);
      const isHtmlItem = isHtml(fileExst);

      let path = "";

      if (isArchiveItem) path = "file_archive.svg";

      if (isImageItem) path = "image.svg";

      if (isSoundItem) path = "sound.svg";

      if (isHtmlItem) path = "html.svg";

      if (path) return iconSize32.get(path) ?? "";

      switch (fileExst) {
        case ".avi":
          path = "avi.svg";
          break;
        case ".csv":
          path = "csv.svg";
          break;
        case ".djvu":
          path = "djvu.svg";
          break;
        case ".doc":
          path = "doc.svg";
          break;
        case ".docm":
          path = "docm.svg";
          break;
        case ".docx":
          path = "docx.svg";
          break;
        case ".dotx":
          path = "dotx.svg";
          break;
        case ".dvd":
          path = "dvd.svg";
          break;
        case ".epub":
          path = "epub.svg";
          break;
        case ".pb2":
        case ".fb2":
          path = "fb2.svg";
          break;
        case ".flv":
          path = "flv.svg";
          break;
        case ".fodt":
          path = "fodt.svg";
          break;
        case ".iaf":
          path = "iaf.svg";
          break;
        case ".ics":
          path = "ics.svg";
          break;
        case ".m2ts":
          path = "m2ts.svg";
          break;
        case ".mht":
          path = "mht.svg";
          break;
        case ".mkv":
          path = "mkv.svg";
          break;
        case ".mov":
          path = "mov.svg";
          break;
        case ".mp4":
          path = "mp4.svg";
          break;
        case ".mpg":
          path = "mpg.svg";
          break;
        case ".odp":
          path = "odp.svg";
          break;
        case ".ods":
          path = "ods.svg";
          break;
        case ".odt":
          path = "odt.svg";
          break;
        case ".otp":
          path = "otp.svg";
          break;
        case ".ots":
          path = "ots.svg";
          break;
        case ".ott":
          path = "ott.svg";
          break;
        case ".pdf":
          path = "pdf.svg";
          break;
        case ".pot":
          path = "pot.svg";
          break;
        case ".pps":
          path = "pps.svg";
          break;
        case ".ppsx":
          path = "ppsx.svg";
          break;
        case ".ppt":
          path = "ppt.svg";
          break;
        case ".pptm":
          path = "pptm.svg";
          break;
        case ".pptx":
          path = "pptx.svg";
          break;
        case ".rtf":
          path = "rtf.svg";
          break;
        case ".svg":
          path = "svg.svg";
          break;
        case ".txt":
          path = "txt.svg";
          break;
        case ".webm":
          path = "webm.svg";
          break;
        case ".xls":
          path = "xls.svg";
          break;
        case ".xlsm":
          path = "xlsm.svg";
          break;
        case ".xlsx":
          path = "xlsx.svg";
          break;
        case ".xps":
          path = "xps.svg";
          break;
        case ".xml":
          path = "xml.svg";
          break;
        case ".oform":
          path = "oform.svg";
          break;
        case ".docxf":
          path = "docxf.svg";
          break;
        case ".sxc":
          path = "sxc.svg";
          break;
        case ".et":
          path = "et.svg";
          break;
        case ".ett":
          path = "ett.svg";
          break;
        case ".sxw":
          path = "sxw.svg";
          break;
        case ".stw":
          path = "stw.svg";
          break;
        case ".wps":
          path = "wps.svg";
          break;
        case ".wpt":
          path = "wpt.svg";
          break;
        case ".mhtml":
          path = "mhtml.svg";
          break;
        case ".dps":
          path = "dps.svg";
          break;
        case ".dpt":
          path = "dpt.svg";
          break;
        case ".sxi":
          path = "sxi.svg";
          break;
        default:
          path = "file.svg";

          break;
      }

      return iconSize32.get(path) ?? "";
    },
    [getIconProp, isArchive, isHtml, isImage, isSound],
  );

  return { getIcon };
};

export default useFilesSettings;
