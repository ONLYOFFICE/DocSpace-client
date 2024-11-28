export const FileType = {
  Folder: 'folder',
  File: 'file',
  Room: 'room',
  Archive: 'archive',
  RootFolder: 'root',
  Privacy: 'privacy'
};

export const FilterType = {
  None: 'none',
  FilesOnly: 'filesOnly',
  FoldersOnly: 'foldersOnly',
  DocumentsOnly: 'documentsOnly',
  PresentationsOnly: 'presentationsOnly',
  SpreadsheetsOnly: 'spreadsheetsOnly',
  ImagesOnly: 'imagesOnly',
  MediaOnly: 'mediaOnly',
  ArchiveOnly: 'archiveOnly',
  FilesAndFolders: 'filesAndFolders'
};

export const FolderType = {
  USER: 0,
  COMMON: 1,
  SHARE: 2,
  PROJECT: 3,
  Privacy: 4
};

export const FileStatus = {
  None: 0,
  Editing: 1,
  MustSave: 2,
  IsNew: 3,
  Downloading: 4
};

export const RoomsType = {
  PublicRoom: "public",
  CustomRoom: "custom",
  FillingFormsRoom: "fillingForms",
  EditingRoom: "editing",
  ReviewRoom: "review",
  ReadOnlyRoom: "readOnly",
  CustomRoomShare: "customShare",
  PublicRoomShare: "publicShare"
};

export const RoomsProviderType = {
  OnlyMe: "onlyMe",
  AllUsers: "allUsers",
  SpecificUsers: "specificUsers"
};

export const ShareAccessRights = {
  None: "none",
  Read: "read",
  ReadWrite: "readWrite",
  CustomFilter: "customFilter",
  Comment: "comment",
  FillForms: "fillForms",
  Review: "review",
  RoomManager: "roomManager",
  RoomAdmin: "roomAdmin"
};

export const Events = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete"
};

export const FilterKeys = {
  customQuota: "customQuota",
  defaultQuota: "defaultQuota"
};

export const RoomSearchArea = {
  Active: "active",
  Archive: "archive"
};
