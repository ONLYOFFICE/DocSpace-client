import { Security } from "./Security.type";

export type FileByRoleType = {
  id: number;
  parentId: number;
  originId: number;
  originRoomId: number;
  security: Security;
  folderIdDisplay: number;
  deletedPermanentlyOn: string;
  denyDownload: boolean;
  denySharing: boolean;
  rootId: number;
  title: string;
  createBy: string;
  modifiedBy: string;
  access: number;
  shared: boolean;
  providerId: number;
  createOn: string;
  modifiedOn: string;
  rootFolderType: number;
  rootCreateBy: string;
  isNew: boolean;
  fileEntryType: number;
};
