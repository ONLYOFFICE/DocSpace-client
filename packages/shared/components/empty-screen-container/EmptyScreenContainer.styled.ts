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

import styled from "styled-components";
import {
  mobile,
  tablet,
  transitionalScreenSize,
  NoUserSelect,
} from "../../utils";
import { Base } from "../../themes";

const EmptyContentBody = styled.div<{
  withoutFilter?: boolean;
  subheadingText?: boolean;
  descriptionText?: boolean;
}>`
  margin: 0 auto;
  padding-top: ${(props) =>
    props.withoutFilter
      ? "91px" // calculated without section body padding and without filter
      : "52px"}; //calculated without section body padding, margin of filter

  grid-template-columns: 1fr;
  display: grid;

  grid-template-areas:
    "img"
    "headerText"
    ${(props) => props.subheadingText && `"subheadingText"`}
    ${(props) => props.descriptionText && `"descriptionText"`}
    "button";

  gap: 0px;
  width: 640px;

  grid-template-rows: max-content;
  justify-items: center;

  .ec-image {
    grid-area: img;
    height: 100px;
    width: 100px;
    margin-bottom: 32px;
    ${NoUserSelect}
  }

  .ec-header {
    grid-area: headerText;
    font-size: 16px;
    color: ${(props) => props.theme.emptyContent.header.color};
    text-align: center;
  }

  .ec-subheading {
    grid-area: subheadingText;
  }

  .ec-desc {
    grid-area: descriptionText;
    line-height: 18px;
    margin-top: 8px;
    color: ${(props) => props.theme.emptyContent.description.color};
    text-align: center;
  }

  .ec-buttons {
    grid-area: button;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 24px;

    svg {
      path {
        fill: ${(props) => props.theme.emptyContent.button.colorLink};
      }
    }

    a {
      color: ${(props) => props.theme.emptyContent.button.colorLink};
    }
    span {
      color: ${(props) => props.theme.emptyContent.button.colorText};
    }
  }
  @media ${transitionalScreenSize} {
    width: fit-content;
    max-width: 640px;
  }

  @media ${tablet} {
    padding-top: ${(props) =>
      props.withoutFilter
        ? "109px" // calculated without section body padding and without filter
        : "71px"}; // calculated without section body padding, margin of filter
    max-width: 480px;
  }

  @media ${mobile} {
    padding-top: 31px;
    padding-top: ${(props) =>
      props.withoutFilter
        ? "69px" // calculated without section body padding and without filter
        : "31px"}; // calculated without section body padding, margin of filter
    max-width: 343px;
    padding-inline: 28px;
    width: fit-content;
    .ec-image {
      height: 75px;
      width: 75px;
    }

    .ec-buttons {
      max-width: 274px;
    }
  }
`;

EmptyContentBody.defaultProps = { theme: Base };

const EmptyContentImage = styled.img`
  background: no-repeat 0 0 transparent;
`;

export { EmptyContentBody, EmptyContentImage };
