import React from "react";

import {
  StyledArrowIcon,
  StyledExpanderDownIcon,
  StyledExpanderDownIconRotate,
  StyledHeading,
  StyledTextContainer,
} from "../Navigation.styled";

import { ITextProps } from "../Navigation.types";

const Text = ({
  title,
  isRootFolder,
  isOpen,
  isRootFolderTitle,
  onClick,
  ...rest
}: ITextProps) => {
  return (
    <StyledTextContainer
      isRootFolder={isRootFolder}
      onClick={onClick}
      isRootFolderTitle={isRootFolderTitle}
      {...rest}
    >
      <StyledHeading
        title={title}
        truncate
        isRootFolderTitle={isRootFolderTitle}
      >
        {title}
      </StyledHeading>

      {isRootFolderTitle && <StyledArrowIcon />}

      {!isRootFolderTitle && !isRootFolder ? (
        isOpen ? (
          <StyledExpanderDownIconRotate />
        ) : (
          <StyledExpanderDownIcon />
        )
      ) : null}
    </StyledTextContainer>
  );
};

export default React.memo(Text);
