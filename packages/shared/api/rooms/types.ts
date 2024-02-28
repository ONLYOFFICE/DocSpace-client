import { TFile, TFolder } from "../files/types";
import { FolderType, RoomsType, ShareAccessRights } from "../../enums";
import { TCreatedBy, TPathParts } from "../../types";

export type TLogo = {
  original: string;
  large: string;
  medium: string;
  small: string;
  color?: string;
};

export type TRoomSecurity = {
  Read: boolean;
  Create: boolean;
  Delete: boolean;
  EditRoom: boolean;
  Rename: boolean;
  CopyTo: boolean;
  Copy: boolean;
  MoveTo: boolean;
  Move: boolean;
  Pin: boolean;
  Mute: boolean;
  EditAccess: boolean;
  Duplicate: boolean;
  Download: boolean;
  CopySharedLink: boolean;
};

export type TRoom = {
  parentId: number;
  filesCount: number;
  foldersCount: number;
  new: number;
  mute: boolean;
  tags: string[];
  logo: TLogo;
  pinned: boolean;
  roomType: RoomsType;
  private: boolean;
  inRoom: boolean;
  id: number;
  rootFolderId: number;
  canShare: boolean;
  title: string;
  access: ShareAccessRights;
  shared: boolean;
  created: Date;
  createdBy: TCreatedBy;
  updated: Date;
  rootFolderType: FolderType;
  updatedBy: TCreatedBy;
  isArchive?: boolean;
  security: TRoomSecurity;
};

export type TGetRooms = {
  files: TFile[];
  folders: TRoom[];
  current: TFolder;
  pathParts: TPathParts[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
};
