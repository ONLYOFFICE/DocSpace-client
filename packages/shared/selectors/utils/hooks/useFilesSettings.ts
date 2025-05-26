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

import React from "react";

import api from "../../../api";
import { TFilesSettings } from "../../../api/files/types";
import { presentInArray } from "../../../utils";
import { iconSize32 } from "../../../utils/image-helpers";
import { HTML_EXST, EBOOK_EXST } from "../../../constants";
import { toastr } from "../../../components/toast";
import { TData } from "../../../components/toast/Toast.type";

import { TGetIcon } from "../types";

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

  const isEbook = React.useCallback(
    (extension: string) => presentInArray(EBOOK_EXST, extension),
    [],
  );

  const determineIconPath = React.useCallback(
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

  const getIcon = React.useCallback(
    (fileExst: string) => {
      if (getIconProp) return getIconProp(32, fileExst) ?? "";
      if (!filesSettings) return "";

      const path = determineIconPath(fileExst);
      return iconSize32.has(path)
        ? (iconSize32.get(path) ?? "")
        : (iconSize32.get("file.svg") ?? "");
    },
    [filesSettings, getIconProp, determineIconPath],
  );

  return {
    getIcon,
    extsWebEdited: filesSettings?.extsWebEdited,
    isLoading,
    displayFileExtension: filesSettings?.displayFileExtension,
  };
};

export default useFilesSettings;
