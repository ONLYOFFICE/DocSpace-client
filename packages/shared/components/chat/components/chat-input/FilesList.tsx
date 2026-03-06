// (c) Copyright Ascensio System SIA 2009-2026
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
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import CloseCircleReactSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import type { FilesListProps } from "../../Chat.types";
import { downloadImageAsBase64 } from "../../utils";

import styles from "./ChatInput.module.scss";

const FilesList = ({
  files,
  isFixed,
  multimodal,
  getIcon,
  onRemove,
}: FilesListProps) => {
  const [imgsBase64, setImgsBase64] = React.useState<Map<string, string>>(
    new Map(),
  );

  React.useEffect(() => {
    if (!files.length) return;

    const imgFiles = files.filter(
      (file) =>
        file.fileExst && multimodal?.image.formats.includes(file.fileExst),
    );

    if (!imgFiles.length) return;

    const downloadImages = async () => {
      const newImg = new Map<string, string>();

      for (const file of imgFiles) {
        if (!file.viewUrl || !file.id) continue;

        const result = await downloadImageAsBase64(file.viewUrl);
        newImg.set(file.id.toString(), result);
      }

      setImgsBase64(newImg);
    };

    downloadImages();
  }, [files, multimodal]);

  if (!files.length) return null;

  return (
    <div
      className={classNames(styles.filesList, {
        [styles.filesListFixed]: isFixed,
      })}
    >
      <Scrollbar noScrollY>
        <div className={styles.filesListWrapper}>
          {files.map((file) => {
            const isImage =
              file.fileExst &&
              multimodal?.image.formats.includes(file.fileExst);

            return (
              <div
                className={styles.filesListItem}
                key={file.id}
                style={{ maxWidth: "300px" }}
                data-testid="files-list-item"
              >
                {!isImage && (() => {
                  const icon = getIcon(24, file.fileExst ?? "");
                  if (typeof icon === "string")
                    return (
                      <ReactSVG
                        src={icon}
                        className={styles.filesListItemIcon}
                      />
                    );
                  if (icon) {
                    const IconComponent = icon;
                    return (
                      <div className={styles.filesListItemIcon}>
                        <IconComponent />
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className={styles.filesListItemInfo}>
                  {isImage ? (
                    imgsBase64.get(file.id?.toString() || "") ? (
                      <img
                        className={styles.filesListItemImage}
                        src={imgsBase64.get(file.id?.toString() || "")}
                        alt={file.title}
                      />
                    ) : (
                      <Loader
                        className={styles.loader}
                        size="20px"
                        type={LoaderTypes.track}
                      />
                    )
                  ) : (
                    <div className={styles.filesListItemInfoText}>
                      <Text
                        fontSize="12px"
                        lineHeight="16px"
                        fontWeight={600}
                        truncate
                      >
                        {file.title?.replaceAll(file?.fileExst || "", "")}
                      </Text>
                      <Text
                        fontSize="12px"
                        lineHeight="16px"
                        fontWeight={600}
                        as="span"
                      >
                        {file.fileExst}
                      </Text>
                    </div>
                  )}

                  {onRemove ? (
                    <IconButton
                      iconName={CloseCircleReactSvgUrl}
                      size={16}
                      isClickable
                      onClick={() => onRemove(file)}
                      dataTestId="remove-file-button"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Scrollbar>
    </div>
  );
};

export default FilesList;
