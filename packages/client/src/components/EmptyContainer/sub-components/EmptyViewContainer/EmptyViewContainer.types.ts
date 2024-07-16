import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type {
  FilesSelectorFilterTypes,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type { Nullable } from "@docspace/shared/types";

export type UploadType = "pdf" | "file" | "folder";

export type ExtensiontionType = "docx" | "xlsx" | "pptx" | "pdf" | undefined;

export type CreateEvent = Event & {
  payload?: {
    extension: ExtensiontionType;
    id: number;
    withoutDialog?: boolean;
  };
};

export interface EmptyViewContainerProps {
  type: RoomsType;
  folderId: number;
  access?: Nullable<ShareAccessRights>;
  security?: Nullable<TFolderSecurity | TRoomSecurity>;
  parentRoomType: Nullable<FolderType>;
  folderType: Nullable<FolderType>;
  isFolder: boolean;
  isArchiveFolderRoot: boolean;
  onClickInviteUsers?: (folderId: string | number, roomType: RoomsType) => void;
  setSelectFileFormRoomDialogVisible?: TStore["dialogsStore"]["setSelectFileFormRoomDialogVisible"];
  onCreateAndCopySharedLink?: TStore["contextOptionsStore"]["onCreateAndCopySharedLink"];
  selectedFolder?: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
}

export type OptionActions = {
  inviteUser: VoidFunction;
  onCreate: (extension: ExtensiontionType, withoutDialog?: boolean) => void;
  uploadFromDocspace: (
    filterParam: FilesSelectorFilterTypes,
    openRoot?: boolean,
  ) => void;
  onUploadAction: (type: UploadType) => void;
  createAndCopySharedLink: VoidFunction;
};
