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

import { Row } from "@docspace/shared/components/rows";
import { Text } from "@docspace/shared/components/text";
import { mobile } from "@docspace/shared/utils";

const StyledBaseQuotaComponent = styled.div`
  .quotas_description {
    margin-bottom: 20px;
  }

  .paid-badge {
    cursor: auto;
  }

  .toggle-container {
    margin-bottom: 32px;
    .quotas_toggle-button {
      position: static;
    }

    .toggle_label {
      margin-top: 10px;
      margin-bottom: 16px;

      ${(props) =>
        props.isDisabled && `color: ${props.theme.text.disableColor}`};
    }
  }
  .category-item-description {
    color: ${(props) =>
      props.theme.client.settings.storageManagement.descriptionColor};
  }
`;

const StyledMainTitle = styled(Text)`
  margin-bottom: 16px;
`;
const StyledDiscSpaceUsedComponent = styled.div`
  margin-top: 16px;

  .disk-space_title {
    color: ${(props) =>
      props.theme.client.settings.storageManagement.grayBackgroundText};
  }
  .disk-space_link {
    text-decoration: underline;
  }
  .button-container {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    .text-container {
      display: grid;
      min-height: 35px;
      .last-update {
        color: ${(props) =>
          props.theme.client.settings.storageManagement.descriptionColor};
      }
    }

    @media ${mobile} {
      flex-direction: column;
    }
  }

  .disk-space_content {
    display: grid;
    grid-template-columns: 1fr 16px;

    border-radius: 6px;

    .disk-space_size-info {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-inline-end: 8px;
      p {
        margin-inline-end: 16px;
      }
    }
    .disk-space_icon {
      display: flex;
      align-items: center;
    }
  }
`;

const StyledDiagramComponent = styled.div`
  .diagram_slider,
  .diagram_description {
    margin-top: 16px;
  }
  .diagram_slider {
    width: 100%;
    max-width: ${(props) => props.maxWidth}px;
    display: flex;
    background: ${(props) =>
      props.theme.client.settings.payment.backgroundColor};
    border-radius: 46px;
    overflow: hidden;
  }
  .diagram_description {
    display: flex;

    flex-wrap: wrap;

    .diagram_folder-tag {
      display: flex;
      margin-inline-end: 24px;
      padding-bottom: 8px;

      .tag_text {
        margin-inline-start: 4px;
      }
    }

    @media ${mobile} {
      flex-direction: column;
    }
  }
`;

const StyledFolderTagSection = styled.div`
  height: 12px;
  ${(props) =>
    props.width !== 0 &&
    `border-inline-end: 1px solid ${props.theme.client.settings.payment.backgroundColor}`};
  background: ${(props) => props.color};
  width: ${(props) => `${props.width}%`};
`;

const StyledFolderTagColor = styled.div`
  margin: auto 0;

  width: 12px;
  height: 12px;
  background: ${(props) => props.color};
  border-radius: 50%;
  margin-inline-end: 4px;
`;

const StyledStatistics = styled.div`
  max-width: 700px;

  .paid-badge {
    cursor: auto;
  }

  .statistics-description {
    margin-bottom: 20px;
  }
  .statistics-container {
    margin-bottom: 40px;
  }
  .item-statistic {
    margin-bottom: 4px;
  }

  .button-element {
    margin-top: 20px;
  }
`;

const StyledDivider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${(props) =>
    props.theme.client.settings.storageManagement.dividerColor};
  margin: 28px 0 28px;
`;

const StyledSimpleFilesRow = styled(Row)`
  .row_content {
    gap: 12px;
    align-items: center;
    height: 56px;
    .row_name {
      width: 100%;
      overflow: hidden;

      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .user-icon {
      .react-svg-icon {
        height: 32px;
        border-radius: 50%;
      }
    }
  }
`;

const StyledMainInfo = styled.div`
  display: flex;
  flex-wrap: wrap;

  border-radius: 6px;

  column-gap: 24px;
  row-gap: 12px;
  padding-right: 12px;
  p {
    color: ${(props) =>
      props.theme.client.settings.storageManagement.grayBackgroundText};
  }
`;

const StyledBody = styled.div`
  max-width: 660px;

  .title-container {
    display: flex;
    align-items: flex-start;
    gap: 4px;
  }
`;

export {
  StyledBody,
  StyledBaseQuotaComponent,
  StyledDiscSpaceUsedComponent,
  StyledFolderTagSection,
  StyledFolderTagColor,
  StyledDiagramComponent,
  StyledStatistics,
  StyledDivider,
  StyledSimpleFilesRow,
  StyledMainInfo,
  StyledMainTitle,
};
