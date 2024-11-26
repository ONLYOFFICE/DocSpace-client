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

import { Base } from "../../themes";
import { injectDefaultTheme } from "../../utils";

const StyledTooltip = styled.div.attrs(injectDefaultTheme)<{
  maxWidthProp?: string;
  color?: string;
}>`
  .__react_component_tooltip {
    background-color: ${(props) =>
      props.color ? props.color : props.theme.tooltip.color};
    border-radius: ${(props) => props.theme.tooltip.borderRadius};
    -moz-border-radius: ${(props) => props.theme.tooltip.borderRadius};
    -webkit-border-radius: ${(props) => props.theme.tooltip.borderRadius};
    box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    -moz-box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    -webkit-box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    padding: ${(props) => props.theme.tooltip.padding};
    max-width: ${(props) =>
      `min(100vw, ${
        props.maxWidthProp ? props.maxWidthProp : props.theme.tooltip.maxWidth
      })`};
    color: ${(props) => props.theme.tooltip.textColor};
    z-index: 999;

    box-sizing: border-box;

    p,
    div,
    span {
      color: ${(props) => props.theme.tooltip.textColor};
    }

    &:before {
      border: ${(props) => props.theme.tooltip.before.border};
    }
    &:after {
      border: ${(props) => props.theme.tooltip.after.border};
      background-color: ${(props) =>
        props.color ? props.color : props.theme.tooltip.color} !important;
    }
  }

  .__react_component_tooltip.place-left::after {
    border-inline-start: none !important;
  }

  .__react_component_tooltip.place-right::after {
    border-inline-end: none !important;
  }

  .__react_component_tooltip.place-top::after {
    border-top: none !important;
  }

  .__react_component_tooltip.place-bottom::after {
    border-bottom: none !important;
  }

  .__react_component_tooltip.place-left::before {
    background: none !important;
  }

  .__react_component_tooltip.place-right::before {
    background: none !important;
  }

  .__react_component_tooltip.place-top::before {
    background: none !important;
  }

  .__react_component_tooltip.place-bottom::before {
    background: none !important;
  }

  .__react_component_tooltip.place-bottom::after,
  .__react_component_tooltip.place-top::after,
  .__react_component_tooltip.place-right::after,
  .__react_component_tooltip.place-left::after {
    display: none;
  }
`;

export default StyledTooltip;
