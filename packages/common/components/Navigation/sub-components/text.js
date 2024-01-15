import React from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";

import ExpanderDownIcon from "PUBLIC_DIR/images/expander-down.react.svg";
import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";

import { Heading } from "@docspace/shared/components/heading";

import { tablet, mobile, commonIconsStyles } from "@docspace/shared/utils";

import { Base } from "@docspace/shared/themes";

const StyledTextContainer = styled.div`
  display: flex;

  align-items: center;

  flex-direction: row;

  position: relative;

  ${(props) =>
    !props.isRootFolder && !props.isRootFolderTitle && "cursor: pointer"};
  ${(props) =>
    props.isRootFolderTitle &&
    (props.theme.interfaceDirection === "rtl"
      ? "padding-left: 3px;"
      : "padding-right: 3px;")};

  ${(props) =>
    !props.isRootFolderTitle &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `};
`;

const StyledHeading = styled(Heading)`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
  line-height: 24px;

  margin: 0;

  ${(props) =>
    props.isRootFolderTitle &&
    `color: ${props.theme.navigation.rootFolderTitleColor}`};

  @media ${tablet} {
    font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    line-height: 28px;
  }

  @media ${mobile} {
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    line-height: 24px;
  }
`;

const StyledExpanderDownIcon = styled(ExpanderDownIcon)`
  min-width: 8px !important;
  width: 8px !important;
  min-height: 18px !important;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0 4px 0 2px;
        `
      : css`
          padding: 0 2px 0 4px;
        `}
  path {
    fill: ${(props) => props.theme.navigation.expanderColor};
  }

  ${commonIconsStyles};
`;

const StyledArrowIcon = styled(ArrowIcon)`
  height: 12px;
  min-width: 12px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-right: 6px;
        `
      : css`
          padding-left: 6px;
        `}
  path {
    fill: ${(props) => props.theme.navigation.rootFolderTitleColor};
  }
`;

StyledExpanderDownIcon.defaultProps = { theme: Base };

const StyledExpanderDownIconRotate = styled(ExpanderDownIcon)`
  min-width: 8px !important;
  width: 8px !important;
  min-height: 18px !important;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0 2px 0 4px;
        `
      : css`
          padding: 0 4px 0 2px;
        `}
  transform: rotate(-180deg);

  path {
    fill: ${(props) => props.theme.navigation.expanderColor};
  }

  ${commonIconsStyles};
`;

StyledExpanderDownIconRotate.defaultProps = { theme: Base };

const Text = ({
  title,
  isRootFolder,
  isOpen,
  isRootFolderTitle,
  onClick,
  ...rest
}) => {
  return (
    <StyledTextContainer
      isRootFolder={isRootFolder}
      onClick={onClick}
      isOpen={isOpen}
      isRootFolderTitle={isRootFolderTitle}
      {...rest}
    >
      <StyledHeading
        type="content"
        title={title}
        truncate={true}
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
      ) : (
        <></>
      )}
    </StyledTextContainer>
  );
};

Text.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  isRootFolder: PropTypes.bool,
  onCLick: PropTypes.func,
};

export default React.memo(Text);
