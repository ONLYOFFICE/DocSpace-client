import React from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { tablet, mobile } from "@docspace/shared/utils";
import { NoUserSelect } from "@docspace/shared/utils";

import Base from "@docspace/shared/themes/base";

const StyledSectionHeader = styled.div`
  position: relative;
  display: flex;

  height: 69px;
  min-height: 69px;

  @media ${tablet} {
    height: 61px;
    min-height: 61px;

    ${({ isFormGallery }) =>
      isFormGallery &&
      css`
        height: 69px;
        min-height: 69px;
      `}

    .header-container {
      margin-bottom: 1px;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
  }

  @media ${mobile} {
    height: 53px;
    min-height: 53px;
  }

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-left: 20px;
        `
      : css`
          padding-right: 20px;
        `}

  box-sizing: border-box;

  ${NoUserSelect}

  display: grid;
  align-items: center;

  width: 100%;
  max-width: 100%;

  .header-container {
    display: flex;
  }

  @media ${tablet} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 16px;
            margin-left: 0px;
          `
        : css`
            padding-right: 16px;
            margin-right: 0px;
          `}
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 0px;
          `
        : css`
            margin-right: 0px;
          `}
  }
`;

StyledSectionHeader.defaultProps = { theme: Base };

const SectionHeader = (props) => {
  const {
    viewAs,
    settingsStudio = false,
    className,
    isEmptyPage,
    isTrashFolder,
    isFormGallery,
    ...rest
  } = props;

  return (
    <StyledSectionHeader
      className={`section-header ${className}`}
      isEmptyPage={isEmptyPage}
      viewAs={viewAs}
      settingsStudio={settingsStudio}
      isTrashFolder={isTrashFolder}
      isFormGallery={isFormGallery}
      {...rest}
    />
  );
};

SectionHeader.displayName = "SectionHeader";

SectionHeader.propTypes = {
  isArticlePinned: PropTypes.bool,
  isHeaderVisible: PropTypes.bool,
  settingsStudio: PropTypes.bool,
};
export default SectionHeader;
