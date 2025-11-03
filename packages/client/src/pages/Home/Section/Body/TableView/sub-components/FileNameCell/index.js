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

import { memo, useCallback, useMemo } from "react";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { classNames } from "@docspace/shared/utils";
import { TableCell } from "@docspace/shared/components/table";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import { createPluginFileHandlers } from "@docspace/shared/utils/plugin-file-utils";

import { FileName } from "./FileNameCell.helpers";
import { tableCellStyle } from "./FileNameCell.constants";

const FileNameCell = memo(
  ({
    item,
    titleWithoutExt,
    linkStyles,
    element,
    onContentSelect,
    checked,
    theme,
    t,
    inProgress,
    isIndexEditingMode,
    displayFileExtension,
  }) => {
    const { title, fileExst } = item;

    const onChange = useCallback(
      (e) => {
        onContentSelect && onContentSelect(e.target.checked, item);
      },
      [onContentSelect, item],
    );

    const indexingClass = isIndexEditingMode ? "item-file-name-index" : "";

    const linkProps = useMemo(() => {
      const baseProps = isIndexEditingMode ? null : { ...linkStyles };

      return createPluginFileHandlers(item, baseProps);
    }, [item, isIndexEditingMode]);

    return (
      <>
        {inProgress ? (
          <Loader
            className="table-container_row-loader"
            color=""
            size="20px"
            type={LoaderTypes.track}
          />
        ) : (
          <TableCell
            className={classNames("table-container_element-wrapper", {
              "table-container-index": isIndexEditingMode,
            })}
            style={tableCellStyle}
            hasAccess
            checked={checked}
          >
            <div className="table-container_element-container">
              <div className="table-container_element">{element}</div>
              {!isIndexEditingMode ? (
                <Checkbox
                  className="table-container_row-checkbox"
                  onChange={onChange}
                  isChecked={checked}
                  title={t("Common:TitleSelectFile")}
                />
              ) : null}
            </div>
          </TableCell>
        )}
        <FileName
          title={title}
          color={theme.filesSection.tableView.fileName.linkColor}
          linkProps={linkProps}
          indexingClass={indexingClass}
          titleWithoutExt={titleWithoutExt}
          displayFileExtension={displayFileExtension}
          fileExst={fileExst}
        />
      </>
    );
  },
);

export default FileNameCell;
