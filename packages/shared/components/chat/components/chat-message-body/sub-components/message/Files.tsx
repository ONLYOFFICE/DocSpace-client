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

import { combineUrl } from "../../../../../../utils/combineUrl";

import { ContentType } from "../../../../../../api/ai/enums";

import { Text } from "../../../../../text";

import { MessageFilesProps } from "../../../../Chat.types";

import styles from "../../ChatMessageBody.module.scss";

const Files = ({ files, getIcon }: MessageFilesProps) => {
  if (!files.length) return null;

  return (
    <div className={styles.filesListWrapper}>
      {files.map((file) => {
        if (file.type !== ContentType.Files) return;

        console.log(file);

        const onClick = () => {
          const searchParams = new URLSearchParams();

          searchParams.set("fileId", file.id.toString());

          const url = combineUrl(
            window.location.origin,
            `/doceditor?${searchParams.toString()}`,
          );

          window.open(url, "_blank");
        };

        return (
          <div className={styles.filesListItem} key={file.id} onClick={onClick}>
            <ReactSVG
              src={getIcon(24, file.extension!)}
              className={styles.filesListItemIcon}
            />

            <div className={styles.filesListItemInfo}>
              <div className={styles.filesListItemInfoText}>
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  fontWeight={600}
                  truncate
                >
                  {file.title.replace(file.extension, "")}
                </Text>
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  fontWeight={600}
                  as="span"
                >
                  {file.extension}
                </Text>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Files;
