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

import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { globalColors } from "@docspace/shared/themes";

import { StyledInputGroup } from "../ClientForm.styled";

interface SelectGroupProps {
  label: string;
  selectLabel: string;

  value: string;

  description: string;

  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectGroup = ({
  label,
  selectLabel,

  value,

  description,

  onSelect,
}: SelectGroupProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";

      inputRef.current.files = null;
    }
  };

  return (
    <StyledInputGroup>
      <div className="label">
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          tag=""
          as="p"
          color=""
          textAlign=""
        >
          {label}{" "}
          <span style={{ color: globalColors.lightErrorStatus }}> *</span>
        </Text>
      </div>
      <div className="select">
        <img
          className="client-logo"
          style={{ display: value ? "block" : "none" }}
          alt="img"
          src={value}
        />
        <SelectorAddButton onClick={onClick} />
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          tag=""
          as="p"
          color=""
          textAlign=""
        >
          {selectLabel}
        </Text>
      </div>
      <Text
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        tag=""
        as="p"
        color=""
        textAlign=""
        className="description"
      >
        {description}
      </Text>
      <input
        ref={inputRef}
        id="customFileInput"
        className="custom-file-input"
        multiple
        type="file"
        onChange={onSelect}
        onClick={onInputClick}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/svg+xml"
      />
    </StyledInputGroup>
  );
};

export default SelectGroup;
