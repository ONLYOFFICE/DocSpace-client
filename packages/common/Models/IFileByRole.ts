import { FileByRoleType } from "./../types/FileByRole.type";

export interface IFileByRole extends FileByRoleType {
  selected: boolean;
  isActive: boolean;
  contextOptionsModel: string[];
}
