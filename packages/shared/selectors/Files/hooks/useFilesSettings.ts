// (c) Copyright Ascensio System SIA 2009-2024
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

import api from "../../../api";
import { TFilesSettings } from "../../../api/files/types";
import { presentInArray } from "../../../utils";
import { iconSize32 } from "../../../utils/image-helpers";
import { HTML_EXST } from "../../../constants";
import { toastr } from "../../../components/toast";
import { TData } from "../../../components/toast/Toast.type";

import { TGetIcon } from "../FilesSelector.types";

const useFilesSettings = (
  getIconProp?: TGetIcon,
  settings?: TFilesSettings,
) => {
  const [filesSettings, setFilesSettings] = React.useState<
    TFilesSettings | undefined
  >(settings);
  const [isLoading, setIsLoading] = React.useState(false);

  const getFileSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const newSettings = await api.files.getSettingsFiles();

      setFilesSettings(newSettings);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      toastr.error(e as TData);
    }
  }, []);

  React.useEffect(() => {
    if (!settings) getFileSettings();
  }, [getFileSettings, settings]);

  const isArchive = React.useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsArchive ?? [], extension),
    [filesSettings?.extsArchive],
  );

  const isImage = React.useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsImage ?? [], extension),
    [filesSettings?.extsImage],
  );

  const isSound = React.useCallback(
    (extension: string) =>
      presentInArray(filesSettings?.extsAudio ?? [], extension),
    [filesSettings?.extsAudio],
  );

  const isHtml = React.useCallback(
    (extension: string) => presentInArray(HTML_EXST, extension),
    [],
  );

  const getIcon = React.useCallback(
    (fileExst: string) => {
      if (getIconProp) return getIconProp(32, fileExst);

      if (!filesSettings) return "";

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
    [filesSettings, getIconProp, isArchive, isHtml, isImage, isSound],
  );

  return { getIcon, extsWebEdited: filesSettings?.extsWebEdited, isLoading };
};

export default useFilesSettings;
