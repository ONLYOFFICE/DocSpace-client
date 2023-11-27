import React from "react";
import RectangleSkeleton from "../rectangle";
import { StyledDialogAsideLoader } from "./styled";
import Aside from "../../aside";
import Backdrop from "../../backdrop";

const DialogAsideSkeleton = ({
  isPanel,
  withoutAside,
  withFooterBorder = false
}: any) => {
  const zIndex = 310;

  const renderClearDialogAsideLoader = () => {
    return (
      <StyledDialogAsideLoader
        // @ts-expect-error TS(2769): No overload matches this call.
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
      // @ts-expect-error TS(2322): Type '{ visible: true; isAside: true; zIndex: numb... Remove this comment to see the full error message
      <Backdrop visible isAside zIndex={zIndex} />
      // @ts-expect-error TS(2769): No overload matches this call.
      <StyledDialogAsideLoader visible isPanel={isPanel}>
        <Aside className="dialog-aside-loader" visible zIndex={zIndex}>
          {renderClearDialogAsideLoader()}
        </Aside>
      </StyledDialogAsideLoader>
    </>
  );
};

export default DialogAsideSkeleton;
