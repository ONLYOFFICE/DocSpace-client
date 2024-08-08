import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type {
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type { Nullable } from "@docspace/shared/types";

export type UploadType = "pdf" | "file" | "folder";

export type FolderExtensiontionType = undefined;

export type ExtensiontionType =
  | "docx"
  | "xlsx"
  | "pptx"
  | "pdf"
  | FolderExtensiontionType;

export type CreateEvent = Event & {
  payload?: {
    extension: ExtensiontionType;
    id: number;
    withoutDialog?: boolean;
  };
};

export type AccessType = Nullable<ShareAccessRights> | undefined;

export interface OutEmptyViewContainerProps {
  type: RoomsType;
  folderId: number;

  parentRoomType: Nullable<FolderType>;
  folderType: Nullable<FolderType>;
  isFolder: boolean;
  isArchiveFolderRoot: boolean;
  isRootEmptyPage: boolean;
}

export interface InjectedEmptyViewContainerProps {
  access: Nullable<ShareAccessRights>;
  security: Nullable<TFolderSecurity | TRoomSecurity>;
  selectedFolder?: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
  isGracePeriod: boolean;
  isVisibleInfoPanel: boolean;
  rootFolderType: Nullable<FolderType>;
  onClickInviteUsers: (folderId: string | number, roomType: RoomsType) => void;
  onCreateAndCopySharedLink: TStore["contextOptionsStore"]["onCreateAndCopySharedLink"];
  setSelectFileFormRoomDialogVisible: TStore["dialogsStore"]["setSelectFileFormRoomDialogVisible"];
  setVisibleInfoPanel: (arg: boolean) => void;
  setViewInfoPanel: TStore["infoPanelStore"]["setView"];
  setInviteUsersWarningDialogVisible: TStore["dialogsStore"]["setInviteUsersWarningDialogVisible"];
}

export type EmptyViewContainerProps = OutEmptyViewContainerProps &
  InjectedEmptyViewContainerProps;

export type OptionActions = {
  inviteUser: VoidFunction;
  onCreate: (extension: ExtensiontionType, withoutDialog?: boolean) => void;
  uploadFromDocspace: (
    filterParam: FilesSelectorFilterTypes | FilterType,
    openRoot?: boolean,
  ) => void;
  onUploadAction: (type: UploadType) => void;
  createAndCopySharedLink: VoidFunction;
  openInfoPanel: VoidFunction;
  onCreateRoom: VoidFunction;
};
