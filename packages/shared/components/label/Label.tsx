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

import React from "react";

import { TextWithTooltip as Text } from "../text";

import { LabelProps } from "./Label.types";
import { globalColors } from "../../themes";

const Label = (props: LabelProps) => {
  const {
    isRequired = false,
    error = false,
    title,
    truncate = false,
    isInline = false,
    htmlFor,
    text,
    display,
    className,
    id,
    style,
    children,
  } = props;
  const errorProp = error ? { color: globalColors.lightErrorStatus } : {};

  return (
    <Text
      as="label"
      id={id}
      style={style}
      htmlFor={htmlFor}
      isInline={isInline}
      display={display}
      {...errorProp}
      fontWeight={600}
      truncate={truncate}
      title={title}
      className={className}
      data-testid="label"
      data-truncate={truncate}
      data-inline={isInline}
      data-error={error}
      aria-required={isRequired}
      aria-invalid={error}
    >
      {text}{" "}
      {isRequired ? (
        <span
          style={{ color: globalColors.lightErrorStatus }}
          aria-hidden="true"
          data-testid="required-mark"
        >
          *
        </span>
      ) : null}{" "}
      {children}
    </Text>
  );
};

export { Label };
