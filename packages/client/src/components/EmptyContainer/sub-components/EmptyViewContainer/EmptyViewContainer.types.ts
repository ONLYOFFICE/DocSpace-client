import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type { Nullable } from "@docspace/shared/types";

export type UploadType = "pdf" | "file" | "folder";

export interface EmptyViewContainerProps {
  type: RoomsType;
  folderId: number;
  access?: Nullable<ShareAccessRights>;
  security?: Nullable<TFolderSecurity | TRoomSecurity>;

  onClickInviteUsers?: (folderId: string | number, roomType: RoomsType) => void;
  setSelectFileFormRoomDialogVisible?: TStore["dialogsStore"]["setSelectFileFormRoomDialogVisible"];
}

export type OptionActions = {
  inviteUser: VoidFunction;
  createFormFromFile: VoidFunction;
  onCreateDocumentForm: VoidFunction;
  uploadPDFForm: VoidFunction;
  onUploadAction: (type: UploadType) => void;
};
