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
import { isIOS, isIOS13, isIPad13 } from "react-device-detect";

import { Scrollbar } from "./custom-scrollbar";

import { Base } from "../../themes";
import { mobile, desktop, tablet } from "../../utils";

const StyledScrollbar = styled(Scrollbar)<{ $fixedSize?: boolean }>`
  .scroller::-webkit-scrollbar {
    ${(isIOS || isIOS13 || isIPad13) && `display: none;`}
  }

  .scroll-body {
    padding-inline-end: ${(props) => props.theme.scrollbar.paddingInlineEnd};
    position: relative;
    outline: none;
    tab-index: -1;

    @media ${mobile} {
      padding-inline-end: ${(props) =>
        props.theme.scrollbar.paddingInlineEndMobile};
    }
  }

  .track {
    box-sizing: border-box;
    display: flex;
    padding: 4px;
    border-radius: 8px !important;
    background: transparent !important;
    z-index: 201;

    @media ${desktop} {
      &:hover {
        .thumb-vertical {
          width: 8px !important;
        }

        .thumb-horizontal {
          height: 8px !important;
        }
      }
    }

    @media ${tablet} {
      pointer-events: none;

      .thumb {
        pointer-events: all;
      }
    }
  }

  .track-vertical {
    direction: ${({ theme }) => theme.interfaceDirection};
    height: ${({ noScrollY }) => (noScrollY ? 0 : "100%")} !important;
    width: 16px !important;
    top: 0 !important;
    justify-content: flex-end;
  }

  .track-horizontal {
    width: 100% !important;
    height: 16px !important;
    align-items: flex-end;
    direction: ltr;

    // doesn't require mirroring for LTR
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `left: unset !important; right: 0 !important;`
        : `left: 0 !important;`}
  }

  &.trackYVisible.trackXVisible {
    .track-vertical {
      height: calc(100% - 16px) !important;
    }

    .track-horizontal {
      width: calc(100% - 16px) !important;
    }
  }

  .thumb {
    touch-action: none;
    background-color: ${(props) =>
      props.color ? props.color : props.theme.scrollbar.bgColor} !important;
    position: relative;
    cursor: default !important;

    :hover {
      background-color: ${(props) =>
        props.theme.scrollbar.hoverBgColor} !important;
    }

    :active,
    &.dragging {
      touch-action: none;
      background-color: ${(props) =>
        props.theme.scrollbar.pressBgColor} !important;
    }
  }

  & > .track > .thumb-vertical {
    width: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: width linear 0.1s;

    @media ${desktop} {
      &:active {
        width: 8px !important;
      }
    }

    @media ${tablet} {
      width: 4px !important;
    }
  }

  & > .track > .thumb-horizontal {
    height: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: height linear 0.1s;

    @media ${desktop} {
      &:active {
        height: 8px !important;
      }
    }

    @media ${tablet} {
      height: 4px !important;
    }
  }

  // fix when iframe breaks dragging scroll
  &:has(> .track > .dragging) {
    iframe {
      pointer-events: none;
    }
  }

  // ------- Auto hide styles -------

  &.auto-hide {
    // tracks hidden by default
    .track {
      opacity: 0;
      transition: opacity 0.35s;
    }

    // tracks always shown if hovered or thumb dragged
    .track:is(:hover, :has(> .dragging)) {
      opacity: 1;
    }
  }

  // tracks shown if scroll element was not auto hidden, hovered
  // and there is no another nesting hovered scroll element, dragging thumb or backdrop
  &.auto-hide.scroll-visible:hover:not(
      :has(
          &:hover.trackYVisible,
          &:hover.trackXVisible,
          .thumb.dragging,
          .backdrop-active
        )
    ) {
    > .track {
      opacity: 1;
    }
  }
  // no hover logic for touch devices
  @media (hover: none) {
    &.auto-hide.scroll-visible:not(:has(.backdrop-active)) {
      .track {
        opacity: 1;
      }
    }
  }
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

export default StyledScrollbar;
