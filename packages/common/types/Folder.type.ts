import { CreatedBy } from "./CreatedBy.type";
import { FillQueue } from "./FillQueue.type";
import { Security } from "./Security.type";
import { UpdatedBy } from "./UpdatedBy.type";

export type Folder = {
  parentId: number;
  filesCount: number;
  foldersCount: number;
  new: number;
  mute: boolean;
  pinned: boolean;
  type: number;
  fillQueue: FillQueue[];
  private: boolean;
  id: number;
  roomType?: number;
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
