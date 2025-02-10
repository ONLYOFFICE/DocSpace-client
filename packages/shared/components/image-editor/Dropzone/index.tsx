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

import React, { useState, useRef, useEffect } from "react";
import { imageProcessing } from "../../../utils/common";

import DropzoneComponent from "../../dropzone";
import { toastr } from "../../toast";

const Dropzone = ({
  t,
  setUploadedFile,
  isDisabled,
}: {
  t: (key: string) => string;
  setUploadedFile: (f: File) => void;
  isDisabled?: boolean;
}) => {
  const [loadingFile, setLoadingFile] = useState(false);
  const mount = useRef(false);
  const timer = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onDrop = async ([file]: File[]) => {
    timer.current = setTimeout(() => {
      setLoadingFile(true);
    }, 50);
    try {
      imageProcessing(file)
        .then((f) => {
          if (mount.current) {
            if (f instanceof File) setUploadedFile(f);
          }
        })
        .catch((error) => {
          if (
            error instanceof Error &&
            error.message === "recursion depth exceeded"
          ) {
            toastr.error(t("Common:SizeImageLarge"));
          }
          // console.error(error);
        })
        .finally(() => {
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
          }
          if (mount.current) {
            setLoadingFile(false);
          }
        });
    } catch (error) {
      // console.error(error);
      toastr.error(t("Common:NotSupportedFormat"));
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      if (mount.current) {
        setLoadingFile(false);
      }
    }
  };

  return (
    <DropzoneComponent
      isLoading={loadingFile}
      maxFiles={0}
      isDisabled={isDisabled}
      accept={["image/png", "image/jpeg"]}
      onDrop={onDrop}
      linkMainText={t("Common:DropzoneTitleLink")}
      linkSecondaryText={t("Common:DropzoneTitleSecondary")}
      exstsText={t("Common:DropzoneTitleExsts")}
    />
  );
};

export default Dropzone;
