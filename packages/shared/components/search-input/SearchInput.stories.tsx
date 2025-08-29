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
    <div style={{ width: "300px" }}>
      <SearchInput
        {...args}
        value={searchValue}
        onChange={(v: string) => {
          onChange?.(v);
          setSearchValue(v);
        }}
      />
    </div>
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
    autoRefresh: true,
  },
};

const SizesComponent = () => {
  const [sizes, setSizes] = useState({
    base: "Base size",
    middle: "Middle size",
    large: "Large size",
  });

  const handleChange = (key: string) => (value: string) => {
    setSizes((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={sizes.base}
          onChange={handleChange("base")}
          showClearButton={!!sizes.base}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.middle}
          value={sizes.middle}
          onChange={handleChange("middle")}
          showClearButton={!!sizes.middle}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.large}
          value={sizes.large}
          onChange={handleChange("large")}
          showClearButton={!!sizes.large}
        />
      </div>
    </div>
  );
};

export const Sizes: Story = {
  render: () => <SizesComponent />,
};

const StatesComponent = () => {
  const [values, setValues] = useState({
    normal: "Normal state",
    disabled: "Disabled state",
    scaled: "With scale",
  });

  const handleChange = (key: string) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={values.normal}
          onChange={handleChange("normal")}
          showClearButton={!!values.normal}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={values.disabled}
          onChange={handleChange("disabled")}
          isDisabled
          showClearButton={!!values.disabled}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={values.scaled}
          onChange={handleChange("scaled")}
          scale
          showClearButton={!!values.scaled}
        />
      </div>
    </div>
  );
};

export const States: Story = {
  render: () => <StatesComponent />,
};

const BehaviorsComponent = () => {
  const [searchValues, setSearchValues] = useState({
    withClear: "With clear button",
    autoRefresh: "Auto refresh enabled",
    withPlaceholder: "",
  });

  const handleChange = (key: string) => (value: string) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={searchValues.withClear}
          onChange={handleChange("withClear")}
          showClearButton={!!searchValues.withClear}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          value={searchValues.autoRefresh}
          onChange={handleChange("autoRefresh")}
          autoRefresh
          refreshTimeout={1000}
          showClearButton={!!searchValues.autoRefresh}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SearchInput
          size={InputSize.base}
          placeholder="With placeholder"
          value={searchValues.withPlaceholder}
          onChange={handleChange("withPlaceholder")}
          showClearButton={!!searchValues.withPlaceholder}
        />
      </div>
    </div>
  );
};

export const Behaviors: Story = {
  render: () => <BehaviorsComponent />,
};
