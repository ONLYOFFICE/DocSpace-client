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

import React, { useState } from "react";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";
import { StyledDownloadContent } from "./StyledDownloadDialog";
import DownloadRow from "./DownloadRow";

const DownloadContent = (props) => {
  const {
    t,
    items,
    onSelectFormat,
    onRowSelect,
    titleFormat,
    type,
    extsConvertible,
    title,
    isChecked,
    isIndeterminate,
    theme,
  } = props;

  const getTitleExtensions = () => {
    let arr = [];
    for (const item of items) {
      const exst = item.fileExst;

      arr = [...arr, ...extsConvertible[exst]];
    }

    arr = arr.filter((x, pos) => arr.indexOf(x) !== pos);
    arr = arr.filter((x, pos) => arr.indexOf(x) === pos);

    const formats = [
      {
        key: "original",
        label: t("OriginalFormat"),
        onClick: onSelectFormat,
        "data-format": t("OriginalFormat"),
        "data-type": type,
      },
    ];

    for (const f of arr) {
      formats.push({
        key: f,
        label: f,
        onClick: onSelectFormat,
        "data-format": f,
        "data-type": type,
      });
    }

    return formats;
  };

  const getFormats = (item) => {
    const arrayFormats = item ? extsConvertible[item.fileExst] : [];
    const formats = [
      {
        key: "original",
        label: t("OriginalFormat"),
        onClick: onSelectFormat,
        "data-format": t("OriginalFormat"),
        "data-type": type,
        "data-file-id": item.id,
      },
    ];
    for (const f of arrayFormats) {
      formats.push({
        key: f,
        label: f,
        onClick: onSelectFormat,
        "data-format": f,
        "data-type": type,
        "data-file-id": item.id,
      });
    }

    switch (type) {
      case "documents":
        return formats;
      case "spreadsheets":
        return formats;
      case "presentations":
        return formats;
      case "masterForms":
        return formats;
      default:
        return [];
    }
  };

  const isOther = type === "other";

  const titleData = !isOther && getTitleExtensions();

  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(!isOpen);
  };

  const showHeader = items.length > 1;

  return (
    <StyledDownloadContent isOpen={showHeader ? isOpen : true} theme={theme}>
      {showHeader && (
        <div className="download-dialog_content-wrapper download-dialog-row">
          <div className="download-dialog-main-content">
            <Checkbox
              data-item-id="All"
              data-type={type}
              isChecked={isChecked}
              isIndeterminate={isIndeterminate}
              onChange={onRowSelect}
              className="download-dialog-checkbox"
            />
            <div
              onClick={onOpen}
              className="download-dialog-heading download-dialog-title"
            >
              <Text noSelect fontSize="16px" fontWeight={600}>
                {title}
              </Text>
              <ArrowIcon className="download-dialog-icon" />
            </div>
          </div>
          <div className="download-dialog-actions">
            {(isChecked || isIndeterminate) && !isOther && (
              <LinkWithDropdown
                className="download-dialog-link"
                dropDownClassName="download-dialog-dropDown"
                containerMinWidth="fit-content"
                data={titleData}
                directionX="left"
                directionY="bottom"
                dropdownType="alwaysDashed"
                fontSize="13px"
                fontWeight={600}
                isAside
                withoutBackground
                withExpander
              >
                {titleFormat}
              </LinkWithDropdown>
            )}
          </div>
        </div>
      )}
      <div className="download-dialog_hidden-items">
        {items.map((file) => {
          const dropdownItems =
            !isOther &&
            getFormats(file).filter((x) => x.label !== file.fileExst);

          return (
            <DownloadRow
              t={t}
              key={file.id}
              file={file}
              isChecked={file.checked}
              onRowSelect={onRowSelect}
              type={type}
              isOther={isOther}
              dropdownItems={dropdownItems}
            />
          );
        })}
      </div>
    </StyledDownloadContent>
  );
};

export default DownloadContent;
