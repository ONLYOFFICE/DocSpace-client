import { FileByRoleType } from "./../types/FileByRole.type";

export interface IFileByRole extends FileByRoleType {
  roleId: number;
  selected: boolean;
  isActive: boolean;
  isProgress: boolean;
  contextOptionsModel: string[];
}
