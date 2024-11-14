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

import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

import { mobile } from "@docspace/shared/utils";
import { globalColors, TColorScheme } from "../../themes";

export const EmptyViewWrapper = styled.div`
  margin-inline: auto;

  max-width: 480px;
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 18px;

  padding-top: 61px;

  @media ${mobile} {
    padding-top: 40px;
  }
`;

export const EmptyViewHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .ev-header {
    font-size: 16px;
    color: ${(props) => props.theme.emptyContent.header.color};
    text-align: center;
    margin-bottom: 8px;
    margin-top: 20px;
  }

  .ev-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
    text-align: center;
  }

  @media ${mobile} {
    > svg {
      height: 105px;
      width: 150px;
    }
  }
`;

export const EmptyViewBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  width: 100%;

  &:has(> .ev-link) {
    margin-top: 2px;
  }

  .empty-view--margin {
    margin-top: 18px;
  }

  .ev-link {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: nowrap;
    align-self: center;

    padding: 6px 10px;

    max-width: fit-content;
    text-decoration: none;

    color: ${({ theme: { emptyView, currentColorScheme } }) =>
      currentColorScheme?.main.accent ?? emptyView.link.color};

    background: ${(props) => props.theme.emptyView.link.background};

    border-radius: 6px;

    svg {
      color: inherit;
      g {
        fill: currentColor;
      }
      flex-shrink: 0;
    }

    span {
      font-weight: 600;
      font-size: 13px;
      line-height: 15px;
      /* text-decoration: underline dotted; */
      /* text-underline-offset: 2px; */
    }

    @media (hover: hover) {
      :hover:not(:active) {
        background: ${(props) => props.theme.emptyView.link.hoverBackground};
        & > * {
          opacity: 0.86;
        }
      }
    }

    :active {
      background: ${(props) => props.theme.emptyView.link.PressedBackground};
      & > * {
        filter: brightness(90%);
      }
    }
  }
`;

export const EmptyViewItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  cursor: pointer;
  border-radius: 6px;
  padding: 12px 16px;

  .ev-item__icon {
    width: 36px;
    height: 36px;

    flex: 0 0 36px;
  }

  :nth-child(1) .ev-item__icon {
    rect {
      color: ${globalColors.lightSecondMain};
    }
    path {
      color: ${globalColors.lightBlueMain};
    }
  }
  :nth-child(2) .ev-item__icon {
    rect {
      color: ${globalColors.mainGreen};
    }
    path {
      color: ${globalColors.mainGreen};
    }
  }
  :nth-child(3) .ev-item__icon {
    rect {
      color: ${globalColors.mainOrange};
    }
    path {
      color: ${globalColors.mainOrange};
    }
  }
  :nth-child(4) .ev-item__icon {
    rect {
      color: ${globalColors.purple};
    }
    path {
      color: ${globalColors.purple};
    }
  }

  .ev-item-header {
    font-size: 13px;
    color: ${(props) => props.theme.emptyContent.header.color};
  }

  .ev-item-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
  }

  .ev-item__arrow-icon {
    flex: 0 0 12px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: ${(props) => props.theme.emptyView.items.hoverColor};
    }
  }

  :active {
    background-color: ${(props) => props.theme.emptyView.items.pressColor};
  }
`;

export const EmptyViewItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
`;
