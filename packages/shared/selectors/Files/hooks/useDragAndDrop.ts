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
import { useCallback, useEffect, useState } from "react";
import { TSelectorDragAndDrop } from "../../../components/selector/Selector.types";
import { UseDragAndPropsProps } from "../FilesSelector.types";

export const useDragAndDrop = ({
  withDrag,
  uploadFiles,
}: UseDragAndPropsProps): TSelectorDragAndDrop => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isOuterDragActive, setIsOuterDragActive] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = () => {
      dragCounter += 1;
      if (dragCounter === 1) {
        setIsOuterDragActive(true);
      }
    };

    const handleDragLeave = () => {
      dragCounter -= 1;
      if (dragCounter === 0) {
        setIsOuterDragActive(false);
      }
    };

    const handleDrop = () => {
      dragCounter = 0;
      setIsOuterDragActive(false);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const onDragOver = useCallback((dragActive: boolean) => {
    setIsDragActive((prev) => {
      if (dragActive !== prev) {
        return dragActive;
      }
      return prev;
    });
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const onDragDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragActive(false);
      uploadFiles(acceptedFiles);
    },
    [uploadFiles],
  );

  if (!withDrag) {
    return {};
  }

  return {
    withDrag,
    isDragActive,
    isOuterDragActive,
    onDragLeave,
    onDragOver,
    onDragDrop,
  };
};
