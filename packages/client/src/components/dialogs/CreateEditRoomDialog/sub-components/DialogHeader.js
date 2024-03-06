import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import React from "react";
import { withTranslation } from "react-i18next";

import withLoader from "@docspace/client/src/HOCs/withLoader";
import { IconButton } from "@docspace/shared/components/icon-button";
import CreateEditRoomDilogHeaderLoader from "@docspace/shared/skeletons/create-edit-room/DilogHeader";

const DialogHeader = ({ t, isEdit, isChooseRoomType, onArrowClick }) => {
  return (
    <>
      {isEdit ? (
        <span>{t("RoomEditing")}</span>
      ) : isChooseRoomType ? (
        <span>{t("ChooseRoomType")}</span>
      ) : (
        <div className="header-with-button">
          <IconButton
            size="15px"
            iconName={ArrowPathReactSvgUrl}
            className="sharing_panel-arrow"
            onClick={onArrowClick}
          />
          <div>{t("Files:CreateRoom")}</div>
        </div>
      )}
    </>
  );
};

export default withTranslation(["CreateEditRoomDialog", "Files"])(
  withLoader(DialogHeader)(<CreateEditRoomDilogHeaderLoader />),
);
