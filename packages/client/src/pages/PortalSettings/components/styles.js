// (c) Copyright Ascensio System SIA 2009-2024
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

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

import styled from "styled-components";
import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

export const StyledArrowRightIcon = styled(ArrowRightIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.client.settings.security.arrowFill};
  }

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
`;

StyledArrowRightIcon.defaultProps = { theme: Base };

export const StyledMobileCategoryWrapper = styled.div`
  margin-bottom: 20px;

  .category-item-heading {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .category-item-subheader {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
    margin-bottom: 5px;
  }

  .category-item-description {
    color: ${(props) => props.theme.client.settings.security.descriptionColor};
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    max-width: 1024px;
    line-height: 20px;
  }

  .inherit-title-link {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 7px;`
        : `margin-right: 7px;`}
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    font-weight: 700;
  }

  .link-text {
    margin: 0;
  }
`;

StyledMobileCategoryWrapper.defaultProps = { theme: Base };
