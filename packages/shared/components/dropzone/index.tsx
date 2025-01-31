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
import { useDropzone } from "react-dropzone";
import classNames from "classnames";

import { Loader, LoaderTypes } from "../loader";
import { ColorTheme, ThemeId } from "../color-theme";

import { DropzoneProps } from "./Dropzone.types";
import styles from "./Dropzone.module.scss";

const Dropzone = ({
  isLoading,
  isDisabled = false,
  onDrop,
  accept,
  maxFiles = 0,
  linkMainText,
  linkSecondaryText,
  exstsText,
}: DropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles,
    noClick: isDisabled,
    noKeyboard: isDisabled,
    accept,
    onDrop,
  });

  return (
    <div
      className={classNames(styles.dropzoneWrapper, {
        [styles.isLoading]: isLoading,
      })}
      data-testid="dropzone"
      aria-busy={isLoading}
      aria-disabled={isDisabled}
    >
      {isLoading ? (
        <Loader
          className={styles.dropzoneLoader}
          size="30px"
          type={LoaderTypes.track}
        />
      ) : (
        <div
          {...getRootProps({
            className: styles.dropzone,
            "aria-label": "File upload area",
            "data-testid": "dropzone-input-area",
          })}
        >
          <input
            disabled={isDisabled}
            {...getInputProps({
              "aria-label": "File input",
              "data-testid": "dropzone-input",
            })}
          />
          <div
            className={styles.dropzoneLink}
            data-testid="dropzone-text"
            aria-live="polite"
            aria-relevant="additions removals"
          >
            <ColorTheme
              className={classNames(styles.dropzoneLink, {
                [styles.main]: true,
              })}
              themeId={ThemeId.Link}
              data-testid="dropzone-main-text"
            >
              {linkMainText}
            </ColorTheme>
            <span
              className={classNames(styles.dropzoneLink, {
                [styles.secondary]: true,
              })}
              data-testid="dropzone-secondary-text"
            >
              {linkSecondaryText}
            </span>
          </div>
          <div
            className={styles.dropzoneExsts}
            data-testid="dropzone-file-types"
            aria-label="Supported file types"
          >
            {exstsText}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
