// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";

import { classNames } from "@docspace/shared/utils";

const EmptyFolderWrapper = styled.div`
  .empty-folder_container {
    .empty-folder_container-links {
      display: flex;
      .flex-wrapper_container {
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        row-gap: 16px;
        column-gap: 8px;
        justify-content: center;

        .first-button {
          display: flex;
          .empty-folder_container-icon {
            margin-inline-end: 8px;
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

      & > span {
        color: ${(props) => props.theme.filesEmptyContainer.descriptionColor};
      }
    }

    .empty-folder_container-image {
      margin-top: 3px;
    }

    .empty-folder_container-icon {
      margin-block: 4px 0;
      margin-inline: 0 4px;

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
