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

const FillingStatusContainer = styled.div<{
  isDone?: boolean;
  isInterrupted?: boolean;
}>`
  width: 100%;
  max-width: 425px;
  padding: 10px;

  .status-done-text {
    color: ${(props) => (props.isDone ? "#4781D1" : "#A3A9AE")};
  }

  .status-done-icon {
    circle,
    path {
      stroke: ${(props) => (props.isDone ? "#4781D1" : "#A3A9AE")};
    }
  }

  .status-interrupted-text {
    color: ${(props) => props.isInterrupted && "#F2675A"};
  }

  .status-interrupted-icon {
    circle,
    path {
      stroke: ${(props) => props.isInterrupted && "#F2675A"};
    }
  }

  .status-done-icon,
  .status-interrupted-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `margin-left: 10px;`
        : `margin-right: 10px;`}
  }
`;

FillingStatusContainer.defaultProps = { theme: Base };

const AccordionItem = styled.div<{
  isInterrupted?: boolean;
  isDone?: boolean;
  isOpen?: boolean;
}>`
  width: 100%;

  .accordion-item-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    height: 38px;
    padding: 18px 0;

    .user-avatar {
      padding: 1px;
      border: 2px solid #a3a9ae;
      border-color: ${(props) =>
        (props.isDone && "#4781D1") || (props.isInterrupted && "#F2675A")};
      border-radius: 50%;
    }

    .accordion-displayname {
      color: ${(props) => props.theme.color};
    }

    .accordion-role {
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .arrow-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${(props) =>
        props.isOpen ? "rotate(270deg)" : "rotate(90deg)"};
      path {
        fill: ${(props) => (props.isOpen ? "#4781d1" : "#A3A9AE")};
      }
    }
  }

  .accordion-item-history {
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `padding-right: 15px;`
        : `padding-left: 15px;`}
  }

  .accordion-item-wrapper {
    display: flex;
    align-items: center;
    min-height: 40px;
    margin: ${(props) => (props.isDone || props.isInterrupted ? "0" : "2px 0")};

    ${(props) => {
      const borderValue = `2px ${
        props.isDone || props.isInterrupted ? "solid" : "dashed"
      } #A3A9AE;`;

      return props.theme.interfaceDirection === "rtl"
        ? `border-right: ${borderValue}`
        : `border-left: ${borderValue}`;
    }}
    border-color: ${(props) =>
      (props.isDone && "#4781D1") || (props.isInterrupted && "#F2675A")};

    .status-text {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? `margin-right: 15px;`
          : `margin-left: 15px;`}
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .status-date {
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .filled-status-text {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? `margin-right: 15px;`
          : `margin-left: 15px;`}
      color: ${(props) => (props.isDone ? "#4781D1" : "#657077")};
    }
  }
`;

AccordionItem.defaultProps = { theme: Base };

export { FillingStatusContainer, AccordionItem };
