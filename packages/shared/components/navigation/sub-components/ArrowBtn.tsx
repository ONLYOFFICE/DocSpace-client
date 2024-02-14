import React from "react";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import { IconButton } from "../../icon-button";

import { IArrowButtonProps } from "../Navigation.types";

const ArrowButton = ({
  isRootFolder,
  onBackToParentFolder,
}: IArrowButtonProps) => {
  return !isRootFolder ? (
    <div className="navigation-arrow-container">
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size={17}
        isFill
        onClick={onBackToParentFolder}
        className="arrow-button"
      />
      <div className="navigation-header-separator" />
    </div>
  ) : null;
};

export default React.memo(ArrowButton);
