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
import { StyledTypeCell } from "./CellStyles";
import { FileType } from "@docspace/shared/enums";
import { getDefaultRoomName } from "../../../../../../helpers/filesUtils";

const TypeCell = ({ t, item, sideColor }) => {
  const { fileExst, fileTypeName, fileType, roomType } = item;
  const getItemType = () => {
    switch (fileType) {
      case FileType.Unknown:
        return fileTypeName ? fileTypeName : t("Common:Unknown");
      case FileType.Archive:
        return t("Common:Archive");
      case FileType.Video:
        return t("Common:Video");
      case FileType.Audio:
        return t("Common:Audio");
      case FileType.Image:
        return t("Common:Image");
      case FileType.Spreadsheet:
        return t("Spreadsheet");
      case FileType.Presentation:
        return t("Presentation");
      case FileType.Document:
      case FileType.OForm:
      case FileType.OFormTemplate:
      case FileType.PDF:
        return t("Document");

      default:
        return t("Folder");
    }
  };

  const type = item.isRoom ? getDefaultRoomName(roomType, t) : getItemType();
  const Exst = fileExst ? fileExst.slice(1).toUpperCase() : "";
  const data = `${type} ${Exst}`;

  return (
    <StyledTypeCell
      fontSize="12px"
      fontWeight="600"
      color={sideColor}
      truncate
      title={data}
    >
      <span className="type">{type}</span>&nbsp;
      <span dir="ltr" className="extension">
        {Exst}
      </span>
    </StyledTypeCell>
  );
};
export default TypeCell;
