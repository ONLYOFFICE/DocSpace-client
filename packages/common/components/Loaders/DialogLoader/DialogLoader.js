import React from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import StyledDialogLoader from "./StyledDialogLoader";

const DialogLoader = ({ isLarge, withFooterBorder }) => {
  return (
    <StyledDialogLoader withFooterBorder={withFooterBorder} isLarge={isLarge}>
      <div className="dialog-loader-header">
        <RectangleSkeleton height="29px" />
      </div>
      <div className="dialog-loader-body">
        <RectangleSkeleton height={isLarge ? "175px" : "73px"} />
      </div>
      <div className="dialog-loader-footer">
        <RectangleSkeleton height="40px" />
        <RectangleSkeleton height="40px" />
      </div>
    </StyledDialogLoader>
  );
};

export default DialogLoader;
