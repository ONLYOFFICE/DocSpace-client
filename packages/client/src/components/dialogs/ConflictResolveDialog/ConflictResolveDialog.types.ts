import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { ConflictResolveType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

export type TConflictResolveDialogData = {
  destFolderId: number;
  folderIds: number[];
  fileIds: number[];
  deleteAfter: boolean;
  folderTitle: string;
  isCopy: boolean;
  translations: { [key: string]: string };
  isUploadConflict: boolean;
  newUploadData: {
    files: { file: { name: string; size: string } }[];
    filesSize: number;
  };
};

export type TActiveItem = TFile | TFolder;

export interface ConflictResolveDialogProps {
  visible: boolean;
  setConflictResolveDialogVisible: (value: boolean) => void;
  conflictResolveDialogData: TConflictResolveDialogData;
  items: (TFile | TFolder)[];
  itemOperationToFolder: (data: {
    destFolderId: number;
    folderIds: number[];
    fileIds: number[];
    conflictResolveType: ConflictResolveType;
    deleteAfter: boolean;
    isCopy: boolean;
    translations: {
      [key: string]: string;
    };
  }) => Promise<void>;
  activeFiles: TActiveItem[];
  activeFolders: TActiveItem[];
  setActiveFiles: (items: TActiveItem[]) => void;
  setActiveFolders: (items: TActiveItem[]) => void;
  updateActiveFiles: (items: TActiveItem[]) => void;
  setSelected: (value: string) => void;
  setMoveToPanelVisible: (value: boolean) => void;
  setRestorePanelVisible: (value: boolean) => void;
  setCopyPanelVisible: (value: boolean) => void;
  setRestoreAllPanelVisible: (value: boolean) => void;
  setMoveToPublicRoomVisible: (value: boolean) => void;
  handleFilesUpload: (
    data: {
      files: {
        file: {
          name: string;
          size: string;
        };
      }[];
      filesSize: number;
    },
    t: TTranslation,
    create: boolean,
  ) => void;
}
