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

"use client";

import { useCallback, useState } from "react";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";

export const useFilesSelectorInput = () => {
  const [newPath, setNewPathState] = useState("");
  const [basePath, setBasePathState] = useState("");
  const [isErrorPath, setIsErrorPath] = useState(false);

  const resetNewFolderPath = useCallback(() => {
    setNewPathState(basePath);
  }, [basePath]);

  const updateBaseFolderPath = useCallback(() => {
    setBasePathState(newPath);
  }, [newPath]);

  const toDefaultFileSelector = useCallback(() => {
    setNewPathState("");
    setBasePathState("");
    setIsErrorPath(false);
  }, []);

  const convertPath = useCallback(
    (foldersArray: TBreadCrumb[], fileName?: string) => {
      let path = "";

      if (foldersArray.length === 0) {
        setIsErrorPath(true);

        return path;
      }

      if (foldersArray.length > 1) {
        foldersArray.forEach((item) => {
          if (!path) {
            path += `${item.label}`;
          } else path = `${path} / ${item.label}`;
        });
      } else {
        foldersArray.forEach((item) => {
          path = `${item.label}`;
        });
      }

      if (fileName) path = `${path}/${fileName}`;

      return path;
    },
    [],
  );

  const setBasePath = useCallback(
    (folders: TBreadCrumb[]) => {
      setBasePathState(convertPath(folders));
    },
    [convertPath],
  );

  const setNewPath = useCallback(
    (folders: TBreadCrumb[], fileName?: string) => {
      setNewPathState(convertPath(folders, fileName));

      setIsErrorPath(false);
    },
    [convertPath],
  );

  return {
    newPath,
    basePath,
    isErrorPath,
    setBasePath,
    setNewPath,
    toDefaultFileSelector,
    resetNewFolderPath,
    updateBaseFolderPath,
  };
};
