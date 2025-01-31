import { TFunction } from "i18next";

import { TTranslation } from "@docspace/shared/types";

import EmptyRoomsRootUserDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg";
import EmptyRoomsRootUserLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg";
import DefaultFolderUserDark from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.dark.svg";
import DefaultFolderUserLight from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.light.svg";

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
