import React from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import StyledDialogAsideLoader from "./StyledDialogAsideLoader";
import { Aside } from "@docspace/shared/components";
import { Backdrop } from "@docspace/shared/components";

const DialogAsideLoader = ({
  isPanel,
  withoutAside,
  withFooterBorder = false,
}) => {
  const zIndex = 310;

  const renderClearDialogAsideLoader = () => {
    return (
      <StyledDialogAsideLoader
        withFooterBorder={withFooterBorder}
        isPanel={isPanel}
        visible
      >
        <div className="dialog-loader-header">
          <RectangleSkeleton height="29px" />
        </div>
        <div className="dialog-loader-body">
          <RectangleSkeleton height="200px" />
        </div>

        <div className="dialog-loader-footer">
          <RectangleSkeleton height="40px" />
          <RectangleSkeleton height="40px" />
        </div>
      </StyledDialogAsideLoader>
    );
  };

  return withoutAside ? (
    renderClearDialogAsideLoader()
  ) : (
    <>
      <Backdrop visible isAside zIndex={zIndex} />
      <StyledDialogAsideLoader visible isPanel={isPanel}>
        <Aside className="dialog-aside-loader" visible zIndex={zIndex}>
          {renderClearDialogAsideLoader()}
        </Aside>
      </StyledDialogAsideLoader>
    </>
  );
};

export default DialogAsideLoader;
