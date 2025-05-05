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
import classNames from "classnames";
import { observer } from "mobx-react";

import CloseCircleReactSvgUrl from "PUBLIC_DIR/images/icons/16/close.circle.react.svg?url";

import { Text } from "../../../text";
import { IconButton } from "../../../icon-button";

import { useFilesStore } from "../../store/filesStore";
import { FilePreviewProps } from "../../types";

import styles from "./FilePreview.module.scss";

const FilePreview = ({
  files,

  displayFileExtension,

  withRemoveFile,

  getIcon,
}: FilePreviewProps) => {
  const { removeFile, setWrapperHeight } = useFilesStore();

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!withRemoveFile) return;
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
    }
  }, [files.length, setWrapperHeight, withRemoveFile]);

  return (
    <div
      className={classNames(styles.filePreviewContainer, {
        [styles.withRemove]: withRemoveFile,
      })}
      ref={wrapperRef}
    >
      {files.length === 0
        ? null
        : files.map((file) => {
            const icon = getIcon(24, file.fileExst!);

            return (
              <div key={file.id} className={styles.filePreview}>
                <div className={styles.imageWrapper}>
                  <img src={icon} alt={file.label} />
                </div>
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  fontWeight={600}
                  truncate
                >
                  {file.label}
                </Text>
                {displayFileExtension ? (
                  <Text
                    fontSize="12px"
                    lineHeight="16px"
                    fontWeight={600}
                    className={styles.fileExtension}
                  >
                    {file.fileExst}
                  </Text>
                ) : null}
                {withRemoveFile ? (
                  <IconButton
                    className={styles.removeButton}
                    iconName={CloseCircleReactSvgUrl}
                    isClickable
                    size={16}
                    onClick={() => removeFile(file)}
                  />
                ) : null}
              </div>
            );
          })}
    </div>
  );
};

export default observer(FilePreview);
