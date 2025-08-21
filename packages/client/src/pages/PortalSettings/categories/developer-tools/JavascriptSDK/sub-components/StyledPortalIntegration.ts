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

import styled, { css } from "styled-components";

import { mobile, tablet } from "@docspace/shared/utils/device";
import { isMobile } from "react-device-detect";

import { globalColors } from "@docspace/shared/themes";

const SDKContainer = styled.div`
  box-sizing: border-box;
  @media ${tablet} {
    width: 100%;
  }

  ${isMobile &&
  css`
    width: 100%;
  `}

  .presets-flex {
    display: flex;
    flex-direction: column;
  }
`;

const CategoryHeader = styled.div`
  margin-top: 40px;
  margin-bottom: 16px;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;

  @media ${tablet} {
    margin-top: 24px;
  }

  ${isMobile &&
  css`
    margin-top: 24px;
  `}
`;

const CategoryDescription = styled.div`
  box-sizing: border-box;
  margin-top: 2px;
  max-width: 700px;
  .sdk-description {
    display: inline;
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }
`;

const PresetsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(min(200px, 100%), 1fr));
  gap: 16px;

  max-width: fit-content;

  margin-top: 16px;

  @media ${mobile} {
    display: flex;
    flex-direction: column;
  }
`;

const IntegrationContainer = styled.div<{ color: string }>`
  .integration-header {
    margin-bottom: 8px;
    margin-top: 36px;
  }

  .icons {
    display: flex;
    gap: 8px;
    margin: 16px 0;

    .icon {
      ${(props) =>
        !props.theme.isBase &&
        css`
          svg rect {
            fill: ${globalColors.white};
            fill-opacity: 0.1;
          }

          .icon-zoom {
            path {
              fill: ${globalColors.white};
            }
          }

          .icon-wordpress {
            path:not(:last-child) {
              fill: ${globalColors.white};
            }
          }

          .icon-drupal {
            path:first-child {
              fill: ${globalColors.white};
            }

            path:nth-child(4),
            path:nth-child(5),
            path:nth-child(6) {
              fill: ${globalColors.lightDarkGrayHover};
            }
          }
        `}

      :hover {
        cursor: pointer;
      }
    }
  }

  .link-container {
    display: flex;
    gap: 4px;

    .link {
      text-decoration: underline;
      font-weight: 600;
      line-height: 15px;
    }

    .icon-arrow {
      :hover {
        cursor: pointer;
      }
    }

    .icon-arrow rect {
      fill: unset;
    }

    .icon-arrow path {
      fill: ${(props) => props.color};
    }
  }
`;

export {
  SDKContainer,
  CategoryHeader,
  CategoryDescription,
  PresetsContainer,
  IntegrationContainer,
};
