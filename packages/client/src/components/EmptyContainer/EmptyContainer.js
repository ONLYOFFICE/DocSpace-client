import React from "react";
import styled, { css } from "styled-components";
import EmptyScreenContainer from "@docspace/components/empty-screen-container";

import { classNames } from "@docspace/components/utils/classNames";

const EmptyFolderWrapper = styled.div`
  .empty-folder_container {
    .empty-folder_container-links {
      display: grid;
      margin: 16px 0;
      grid-template-columns: 12px 1fr;
      grid-column-gap: 8px;

      .flex-wrapper_container {
        display: flex;
        flex-wrap: wrap;
        row-gap: 16px;
        column-gap: 8px;
      }
    }

    .empty-folder_container-links:last-child {
      margin-bottom: 0;
    }

    .second-description {
      margin: 32px 0 26px;
    }

    .empty-folder_container-image {
      margin-top: 3px;
    }

    .empty-folder_container-icon {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 4px 0 0 4px;
            `
          : css`
              margin: 4px 4px 0 0;
            `}

      cursor: pointer;
    }

    .empty-folder_room-not-found {
      margin-top: 70px;
    }
  }
`;

const EmptyFoldersContainer = (props) => {
  const imageAlt = "Empty folder image";
  const {
    imageSrc,
    headerText,
    subheadingText,
    descriptionText,
    buttons,
    style,
    imageStyle,
    buttonStyle,
    isEmptyPage,
    sectionWidth,
    isEmptyFolderContainer,
    className,
  } = props;

  return (
    <EmptyFolderWrapper>
      <EmptyScreenContainer
        sectionWidth={sectionWidth}
        className={classNames("empty-folder_container", className)}
        imageStyle={imageStyle}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        buttonStyle={buttonStyle}
        headerText={headerText}
        subheadingText={subheadingText}
        descriptionText={descriptionText}
        buttons={buttons}
        isEmptyPage={isEmptyPage}
        isEmptyFolderContainer={isEmptyFolderContainer}
      />
    </EmptyFolderWrapper>
  );
};

export default EmptyFoldersContainer;
