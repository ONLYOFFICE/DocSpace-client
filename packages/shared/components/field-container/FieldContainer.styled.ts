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

import { tablet } from "../../utils";
import { Base } from "../../themes";

const getHorizontalCss = css<{ removeMargin?: boolean; labelWidth?: string }>`
  display: flex;
  flex-direction: row;
  align-items: start;
  margin: ${(props) =>
    props.removeMargin ? 0 : props.theme.fieldContainer.horizontal.margin};

  .field-label {
    line-height: ${(props) =>
      props.theme.fieldContainer.horizontal.label.lineHeight};
    margin: ${(props) => props.theme.fieldContainer.horizontal.label.margin};
    position: relative;
  }
  .field-label-icon {
    display: inline-flex;
    min-width: ${(props) => props.labelWidth};
    width: ${(props) => props.labelWidth};
  }
  .field-body {
    flex-grow: ${(props) =>
      props.theme.fieldContainer.horizontal.body.flexGrow};
  }
  .icon-button {
    position: relative;
    margin-top: ${(props) =>
      props.theme.fieldContainer.horizontal.iconButton.marginTop};
    margin-inline-start: ${(props) =>
      props.theme.fieldContainer.horizontal.iconButton.marginLeft};
  }
`;

const getVerticalCss = css<{ removeMargin?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin: ${(props) =>
    props.removeMargin ? 0 : props.theme.fieldContainer.vertical.margin};

  .field-label {
    line-height: ${(props) =>
      props.theme.fieldContainer.vertical.label.lineHeight};
    height: ${(props) => props.theme.fieldContainer.vertical.label.height};
    display: inline-block;
  }
  .field-label-icon {
    display: inline-flex;
    width: ${(props) => props.theme.fieldContainer.vertical.labelIcon.width};
    margin: ${(props) => props.theme.fieldContainer.vertical.labelIcon.margin};
  }
  .field-body {
    width: ${(props) => props.theme.fieldContainer.vertical.body.width};
  }
  .icon-button {
    position: relative;
    margin: ${(props) => props.theme.fieldContainer.vertical.iconButton.margin};
    padding: ${(props) =>
      props.theme.fieldContainer.vertical.iconButton.padding};
    display: flex;
    align-items: center;
    height: 100%;
  }
`;

const Container = styled.div<{
  maxwidth?: string;

  color?: string;
  vertical?: boolean;
  removeMargin?: boolean;
  labelWidth?: string;
}>`
  .error-label {
    max-width: ${(props) => (props.maxwidth ? props.maxwidth : "293px")};
    color: ${(props) =>
      props.color ? props.color : props.theme.fieldContainer.errorLabel.color};
    padding-top: 4px;
  }
  ${(props) => (props.vertical ? getVerticalCss : getHorizontalCss)}

  @media ${tablet} {
    ${getVerticalCss}
  }
`;

Container.defaultProps = { theme: Base };
export default Container;
