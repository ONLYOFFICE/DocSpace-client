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
import { Meta, StoryObj } from "@storybook/react";

import { ComboBox } from "./ComboBox";
import { TComboboxProps } from "./ComboBox.types";
import { globalColors } from "../../themes";
import { ComboBoxDisplayType, ComboBoxSize } from "./ComboBox.enums";

const meta = {
  title: "Components/ComboBox",
  component: ComboBox,
  parameters: {
    docs: {
      description: {
        component: `ComboBox is a versatile UI component that combines a text input with a dropdown list. It supports multiple display types, search functionality, and customizable styling options.
          
### Features

- Multiple display types (default, toggle)
- Search functionality with customizable placeholder
- Support for icons and advanced options
- Accessible keyboard navigation
- Customizable styling and theming
- Responsive design

### Accessibility

The ComboBox component includes the following ARIA attributes:

- \`aria-expanded\`: Indicates whether the dropdown list is currently expanded
- \`aria-haspopup\`: Indicates that the component has a popup menu
- \`aria-label\`: Provides a text description of the combobox
- \`role="combobox"\`: Identifies the component as a combobox

### Keyboard Navigation

- Enter/Space: Open/close dropdown
- Arrow Up/Down: Navigate through options
- Escape: Close dropdown
- Tab: Focus next/previous element`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=0%3A1&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    displayType: {
      options: Object.values(ComboBoxDisplayType),
      control: { type: "select" },
      description: "Display style of the combobox",
    },
    size: {
      options: Object.values(ComboBoxSize),
      control: { type: "select" },
      description: "Size of the combobox",
    },
    scaled: {
      control: "boolean",
      description: "Enable scaling based on parent",
    },
    isDisabled: {
      control: "boolean",
      description: "Disable the combobox",
    },
    withSearch: {
      control: "boolean",
      description: "Enable search functionality",
    },
  },
} satisfies Meta<typeof ComboBox>;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "220px", padding: "20px" }}>{children}</div>;
};

const defaultOptions = [
  {
    key: 1,
    label: "Open",
    backgroundColor: globalColors.lightBlueMain,
    color: globalColors.white,
  },
  {
    key: 2,
    label: "Done",
    backgroundColor: globalColors.black,
    color: globalColors.white,
  },
  {
    key: 3,
    label: "In Progress",
    backgroundColor: globalColors.white,
    color: globalColors.grayText,
    border: globalColors.lightBlueMain,
  },
  {
    key: 4,
    label: "Pending Review",
    backgroundColor: globalColors.white,
    color: globalColors.grayText,
    border: globalColors.lightBlueMain,
  },
];

const Template = (args: TComboboxProps) => (
  <Wrapper>
    <ComboBox {...args} />
  </Wrapper>
);

export default meta;

export const Default: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    options: defaultOptions,
    selectedOption: {
      key: 0,
      label: "Select Status",
    },
    dropDownMaxHeight: 200,
    scaled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Default ComboBox with basic configuration.",
      },
    },
  },
};

export const WithSearch: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    withSearch: true,
    searchPlaceholder: "Search status...",
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox with search functionality enabled. Users can filter options by typing.",
      },
    },
  },
};

export const ToggleMode: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    displayType: ComboBoxDisplayType.toggle,
    onToggle: () => console.log("Toggled"),
  },
  parameters: {
    docs: {
      description: {
        story: "ComboBox in toggle mode, useful for simple on/off selections.",
      },
    },
  },
};

export const DifferentSizes: StoryObj<typeof ComboBox> = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {Object.values(ComboBoxSize).map((size) => (
        <ComboBox
          key={size}
          options={defaultOptions}
          selectedOption={{ key: 0, label: `Size: ${size}` }}
          size={size}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "ComboBox in different size variations.",
      },
    },
  },
};

export const WithIcons: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    options: [
      {
        key: 1,
        label: "Document",
        icon: "file",
      },
      {
        key: 2,
        label: "Image",
        icon: "image",
      },
      {
        key: 3,
        label: "Folder",
        icon: "folder",
      },
    ],
    selectedOption: {
      key: 0,
      label: "Select Type",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox with icons in options for better visual representation.",
      },
    },
  },
};

export const Disabled: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled state of the ComboBox.",
      },
    },
  },
};

export const WithSelectedOption: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    selectedOption: defaultOptions[0],
  },
  parameters: {
    docs: {
      description: {
        story: "ComboBox with a pre-selected option.",
      },
    },
  },
};

export const CustomStyling: StoryObj<typeof ComboBox> = {
  render: (args) => <Template {...args} />,
  args: {
    options: [
      {
        key: 1,
        label: "Critical",
        backgroundColor: "#FF4444",
        color: "#FFFFFF",
      },
      {
        key: 2,
        label: "High",
        backgroundColor: "#FF8C00",
        color: "#FFFFFF",
      },
      {
        key: 3,
        label: "Medium",
        backgroundColor: "#FFD700",
        color: "#000000",
      },
      {
        key: 4,
        label: "Low",
        backgroundColor: "#90EE90",
        color: "#000000",
      },
    ],
    selectedOption: {
      key: 0,
      label: "Select Priority",
    },
    noBorder: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox with custom styling for options, demonstrating color customization.",
      },
    },
  },
};
