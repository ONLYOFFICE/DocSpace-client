import type { NavigateFunction, LinkProps } from "react-router-dom";

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

export interface InjectedEmptyViewContainerProps
  extends Pick<
      TStore["contextOptionsStore"],
      "inviteUser" | "onCreateAndCopySharedLink" | "onClickInviteUsers"
    >,
    Pick<
      TStore["dialogsStore"],
      "setSelectFileFormRoomDialogVisible" | "setQuotaWarningDialogVisible"
    >,
    Pick<
      TStore["selectedFolderStore"],
      "access" | "security" | "rootFolderType"
    >,
    Pick<TStore["treeFoldersStore"], "myFolder" | "myFolderId" | "roomsFolder">,
    Pick<TStore["clientLoadingStore"], "setIsSectionFilterLoading"> {
  selectedFolder: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
  userId: string | undefined;
  isVisibleInfoPanel: boolean;
  isWarningRoomsDialog: boolean;
  setVisibleInfoPanel: (arg: boolean) => void;
  setViewInfoPanel: TStore["infoPanelStore"]["setView"];
}

export type EmptyViewContainerProps = OutEmptyViewContainerProps &
  InjectedEmptyViewContainerProps;

export type OptionActions = {
  navigate: NavigateFunction;
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
  inviteRootUser: TStore["contextOptionsStore"]["inviteUser"];
  onGoToPersonal: () => LinkProps;
  onGoToShared: () => LinkProps;
};
