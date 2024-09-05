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

import React from "react";
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";

import { IconButton } from "../icon-button";

import { SelectedItemProps } from "./SelectedItem.types";
import { StyledSelectedItem, StyledLabel } from "./SelectedItem.styled";

export const SelectedItemPure = (props: SelectedItemProps) => {
  const {
    label,
    onClose,
    isDisabled = false,
    onClick,
    isInline = true,
    className,
    id,
    propKey,
    group,
    forwardedRef,
    classNameCloseButton,
    hideCross,
    title,
  } = props;
  if (!label) return null;

  const onCloseClick = (e: React.MouseEvent) => {
    if (!isDisabled) onClose(propKey, label, group || "", e);
  };

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    if (!isDisabled && !target.classList.contains("selected-tag-removed"))
      onClick?.(propKey, label, group, e);
  };

  return (
    <StyledSelectedItem
      onClick={handleOnClick}
      isInline={isInline}
      className={className}
      isDisabled={isDisabled}
      id={id}
      ref={forwardedRef}
      data-testid="selected-item"
      title={title}
    >
      <StyledLabel
        className="selected-item_label"
        truncate
        isDisabled={isDisabled}
      >
        {label}
      </StyledLabel>
      {!hideCross && (
        <IconButton
          className={`selected-tag-removed ${classNameCloseButton}`}
          iconName={CrossReactSvgUrl}
          size={12}
          onClick={onCloseClick}
          isFill
          isDisabled={isDisabled}
        />
      )}
    </StyledSelectedItem>
  );
};

const SelectedItem = React.memo(SelectedItemPure);

export { SelectedItem };
