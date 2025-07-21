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
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import CloseCircleReactSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";

import { TFile } from "../../../../api/files/types";

import { Text } from "../../../text";
import { IconButton } from "../../../icon-button";
import { Scrollbar } from "../../../scrollbar";

import { ChatProps } from "../../types";

import styles from "./ChatInput.module.scss";

type FilesListProps = {
  files: Partial<TFile>[];
  isFixed?: boolean;
  getIcon: ChatProps["getIcon"];
  onRemove?: (file: Partial<TFile>) => void;
};

const FilesList = ({ files, isFixed, getIcon, onRemove }: FilesListProps) => {
  if (!files.length) return null;

  return (
    <div
      className={classNames(styles.filesList, {
        [styles.filesListFixed]: isFixed,
      })}
    >
      <Scrollbar noScrollY>
        <div className={styles.filesListWrapper}>
          {files.map((file) => (
            <div className={styles.filesListItem} key={file.id}>
              <ReactSVG
                src={getIcon(24, file.fileExst!)}
                className={styles.filesListItemIcon}
              />

              <div className={styles.filesListItemInfo}>
                <div className={styles.filesListItemInfoText}>
                  <Text fontSize="12px" lineHeight="16px" fontWeight={600}>
                    {file.title}
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

                {onRemove ? (
                  <IconButton
                    iconName={CloseCircleReactSvgUrl}
                    size={16}
                    isClickable
                    onClick={() => onRemove(file)}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
};

export default FilesList;
