import React from "react";
import { RectangleSkeleton } from "../rectangle";
import { Aside, Backdrop } from "../../components";
import { StyledDialogAsideLoader } from "./Dialog.styled";

import { DialogAsideSkeletonProps } from "./Dialog.types";

const DialogAsideSkeleton = ({
  isPanel,
  withoutAside,
  withFooterBorder = false,
}: DialogAsideSkeletonProps) => {
  const zIndex = 310;

  const renderClearDialogAsideLoader = () => {
    return (
      <StyledDialogAsideLoader
        withFooterBorder={withFooterBorder}
        isPanel={isPanel}
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

      <StyledDialogAsideLoader isPanel={isPanel} withFooterBorder={false}>
        <Aside
          className="dialog-aside-loader"
          visible
          zIndex={zIndex}
          onClose={() => {}}
        >
          {renderClearDialogAsideLoader()}
        </Aside>
      </StyledDialogAsideLoader>
    </>
  );
};

export { DialogAsideSkeleton };
