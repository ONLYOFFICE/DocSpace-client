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

import { inject, observer } from "mobx-react";

import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { isMobile } from "@docspace/shared/utils";

const DownloadRow = (props) => {
  const {
    t,
    file,
    onRowSelect,
    type,
    dropdownItems,
    isOther,
    isChecked,
    getItemIcon,
  } = props;

  // console.log("DownloadRow render");

  const element = getItemIcon(file);

  return (
    <div className="download-dialog-row">
      <div className="download-dialog-main-content">
        <Checkbox
          className="download-dialog-checkbox"
          data-item-id={file.id}
          data-type={type}
          onChange={onRowSelect}
          isChecked={isChecked}
        />
        <div className="download-dialog-icon-contatiner">{element}</div>
        <Text
          className="download-dialog-title"
          truncate
          type="page"
          title={file.title}
          fontSize="14px"
          fontWeight={600}
          noSelect
        >
          {file.title}
        </Text>
      </div>

      <div className="download-dialog-actions">
        {file.checked && !isOther ? (
          <LinkWithDropdown
            className="download-dialog-link"
            dropDownClassName="download-dialog-dropDown"
            isOpen={false}
            dropdownType="alwaysDashed"
            containerMinWidth="fit-content"
            data={dropdownItems}
            directionX="left"
            directionY={isMobile() ? "both" : "bottom"}
            fontSize="13px"
            fontWeight={600}
            hasScroll={isMobile()}
            isAside
            withoutBackground
            withExpander
            manualWidth={isMobile() ? "148px" : undefined}
          >
            {file.format || t("OriginalFormat")}
          </LinkWithDropdown>
        ) : null}
        {isOther && file.fileExst ? (
          <Text
            className="download-dialog-other-text"
            truncate
            type="page"
            title={file.title}
            fontSize="13px"
            fontWeight={600}
            noSelect
          >
            {t("OriginalFormat")}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ filesSettingsStore }) => {
  const { getIcon, getFolderIcon } = filesSettingsStore;

  return {
    getIcon,
    getFolderIcon,
  };
})(observer(DownloadRow));
