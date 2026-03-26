// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";
import styles from "./ClientForm.styled.module.scss";

const mk =
  (...cls: string[]) =>
  ({
    className,
    style,
    children,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement(
      "div",
      {
        className: [...cls, className].filter(Boolean).join(" "),
        style,
        ...rest,
      },
      children,
    );

export const StyledContainer = mk(styles.styledContainer);
export const StyledBlock = mk(styles.styledBlock);
export const StyledHeaderRow = mk(styles.styledHeaderRow);
export const StyledInputBlock = mk(styles.styledInputBlock);
export const StyledInputGroup = mk(styles.styledInputGroup);
export const StyledInputRow = mk(styles.styledInputRow);
export const StyledChipsContainer = mk(styles.styledChipsContainer);
export const StyledScopesName = mk(styles.styledScopesName);
export const StyledScopesCheckbox = mk(styles.styledScopesCheckbox);
export const StyledButtonContainer = mk(styles.styledButtonContainer);
export const StyledInputAddBlock = mk(styles.styledInputAddBlock);
export const StyledCheckboxGroup = mk(styles.styledCheckboxGroup);

export const StyledScopesContainer = ({
  isRequiredError,
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { isRequiredError?: boolean }) =>
  React.createElement(
    "div",
    {
      className: [
        styles.styledScopesContainer,
        isRequiredError ? styles.requiredError : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );
