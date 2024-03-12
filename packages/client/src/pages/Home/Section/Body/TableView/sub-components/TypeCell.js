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
