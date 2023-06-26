import { CreatedBy } from "./CreatedBy.type";
import { RoleType } from "./RoleType";
import { Security } from "./Security.type";
import { UpdatedBy } from "./UpdatedBy.type";

export type Current = {
  parentId: number;
  filesCount: number;
  foldersCount: number;
  new: number;
  mute: boolean;
  pinned: boolean;
  type: number;
  fillQueue: RoleType[];
  private: boolean;
  id: number;
  rootFolderId: number;
  canShare: boolean;
  security: Security;
  title: string;
  access: number;
  shared: boolean;
  created: string;
  createdBy: CreatedBy;
  updated: string;
  rootFolderType: number;
  updatedBy: UpdatedBy;
};
