import React from "react";
import RectangleSkeleton from "../rectangle";
import { StyledDialogLoader } from "./styled";

const DialogSkeleton = ({
  isLarge,
  withFooterBorder
}: any) => {
  return (
    // @ts-expect-error TS(2769): No overload matches this call.
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

export default DialogSkeleton;
