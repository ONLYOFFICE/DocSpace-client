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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { InputSize } from "../text-input";

import { SearchInput } from ".";
import { SearchInputProps } from "./SearchInput.types";

const meta = {
  title: "Form Controls/SearchInput",
  component: SearchInput,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=58-2238&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    onChange: { action: "onChange" },
    onClearSearch: { action: "onClearSearch" },
    onFocus: { action: "onFocus" },
    onClick: { action: "onClick" },
    size: {
      control: "select",
      options: Object.values(InputSize),
    },
    isDisabled: {
      control: "boolean",
    },
    showClearButton: {
      control: "boolean",
    },
    autoRefresh: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SearchInput>;
type Story = StoryObj<typeof SearchInput>;

export default meta;

const Template = ({ value, onChange, ...args }: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(value);

  return (
    <SearchInput
      {...args}
      style={{ width: "20%" }}
      value={searchValue}
      onChange={(v: string) => {
        onChange?.(v);
        setSearchValue(v);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    id: "default-search",
    isDisabled: false,
    size: InputSize.base,
    scale: false,
    placeholder: "Search",
    value: "",
    showClearButton: true,
    autoRefresh: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SearchInput
        size={InputSize.base}
        value="Base size"
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.middle}
        value="Middle size"
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.big}
        value="Big size"
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.huge}
        value="Huge size"
        showClearButton
        style={{ width: "20%" }}
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SearchInput
        size={InputSize.base}
        value="Normal state"
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.base}
        value="Disabled state"
        isDisabled
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.base}
        value="With scale"
        scale
        showClearButton
        style={{ width: "20%" }}
      />
    </div>
  ),
};

export const Behaviors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SearchInput
        size={InputSize.base}
        value="With clear button"
        showClearButton
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.base}
        value="Auto refresh enabled"
        autoRefresh
        refreshTimeout={1000}
        style={{ width: "20%" }}
      />
      <SearchInput
        size={InputSize.base}
        placeholder="With placeholder"
        showClearButton
        style={{ width: "20%" }}
        value=""
      />
    </div>
  ),
};
