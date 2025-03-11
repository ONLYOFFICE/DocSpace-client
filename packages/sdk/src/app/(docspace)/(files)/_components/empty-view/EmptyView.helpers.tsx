import { TTranslation } from "@docspace/shared/types";

import EmptyRoomsRootUserDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg";
import EmptyRoomsRootUserLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg";
import DefaultFolderUserDark from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.dark.svg";
import DefaultFolderUserLight from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.light.svg";
import EmptyFilterFilesLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg";
import EmptyFilterFilesDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg";

export const getTitle = (t: TTranslation) => {
  return t("Common:EmptyScreenFolder");
};

export const getRootTitle = (t: TTranslation) => {
  return t("Common:EmptyRootRoomHeader", {
    productName: t("Common:ProductName"),
  });
};

export const getIcon = (isBaseTheme: boolean) => {
  return isBaseTheme ? <DefaultFolderUserLight /> : <DefaultFolderUserDark />;
};

export const getRootIcon = (isBaseTheme: boolean) => {
  return isBaseTheme ? (
    <EmptyRoomsRootUserLightIcon />
  ) : (
    <EmptyRoomsRootUserDarkIcon />
  );
};

export const getFilterIcon = (isBaseTheme: boolean) => {
  return isBaseTheme ? (
    <EmptyFilterFilesLightIcon />
  ) : (
    <EmptyFilterFilesDarkIcon />
  );
};

export const getRootDescription = (t: TTranslation) => {
  return (
    <>
      <span>{t("Common:RoomEmptyAtTheMoment")}</span>
      <br />
      <span>{t("Common:FilesWillAppearHere")}</span>
    </>
  );
};

export const getDescription = (t: TTranslation) => {
  return t("Common:UserEmptyDescription");
};
