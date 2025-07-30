import { TTranslation } from "../types/index";

import { FileType } from "../enums";

export const getFileTypeName = (
  fileType: FileType | string,
  t: TTranslation,
) => {
  switch (fileType) {
    case FileType.Unknown:
      return t("Common:Unknown");
    case FileType.Archive:
      return t("Common:Archive");
    case FileType.Video:
      return t("Common:Video");
    case FileType.Audio:
      return t("Common:Audio");
    case FileType.Image:
      return t("Common:Image");
    case FileType.Spreadsheet:
      return t("Common:Spreadsheet");
    case FileType.Presentation:
      return t("Common:Presentation");
    case FileType.Diagram:
      return t("Common:Diagram");
    case FileType.Document:
    case FileType.OFormTemplate:
    case FileType.OForm:
    case FileType.PDF:
      return t("Common:Document");
    default:
      return t("Common:Folder");
  }
};
