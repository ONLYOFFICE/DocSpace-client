import React from "react";
import styled, { css } from "styled-components";
import { EmptyScreenContainer } from "@docspace/shared/components";

import { classNames } from "@docspace/shared/utils";

const EmptyFolderWrapper = styled.div`
  .empty-folder_container {
    .empty-folder_container-links {
      display: flex;
      .flex-wrapper_container {
        display: flex;
        flex-wrap: wrap;
        row-gap: 16px;
        column-gap: 8px;
        justify-content: center;

        .first-button {
          display: flex;
          .empty-folder_container-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .empty-folder_container-links:last-child {
      margin-bottom: 0;
    }

    .second-description {
      margin: 32px 0 24px;
      text-align: center;
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
    imageStyle,
    buttonStyle,
    sectionWidth,
    className,
    isEmptyPage,
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
        withoutFilter={isEmptyPage}
      />
    </EmptyFolderWrapper>
  );
};

export default EmptyFoldersContainer;
