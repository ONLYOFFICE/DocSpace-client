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
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg";

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
    dropDownMaxHeight: {
      control: { type: "number" },
    },
    directionY: {
      control: { type: "select" },
      options: ["top", "bottom", "both"],
    },
    directionX: {
      control: { type: "select" },
      options: ["left", "right"],
    },
    fixedDirection: { control: { type: "boolean" } },
    isDefaultMode: { control: { type: "boolean" } },
    disableIconClick: { control: { type: "boolean" } },
    disableItemClick: { control: { type: "boolean" } },
    disableItemClickFirstLevel: { control: { type: "boolean" } },
    displaySelectedOption: { control: { type: "boolean" } },
    displayArrow: { control: { type: "boolean" } },
    showDisabledItems: { control: { type: "boolean" } },
    fillIcon: { control: { type: "boolean" } },
    plusBadgeValue: { control: { type: "number" } },
    forceCloseClickOutside: { control: { type: "boolean" } },
    hideMobileView: { control: { type: "boolean" } },
    isAside: { control: { type: "boolean" } },
    isLoading: { control: { type: "boolean" } },
    isMobileView: { control: { type: "boolean" } },
    isNoFixedHeightOptions: { control: { type: "boolean" } },
    manualWidth: { control: { type: "text" } },
    manualX: { control: { type: "text" } },
    manualY: { control: { type: "text" } },
    modernView: { control: { type: "boolean" } },
    noBorder: { control: { type: "boolean" } },
    offsetX: { control: { type: "number" } },
    opened: { control: { type: "boolean" } },
    searchPlaceholder: { control: { type: "text" } },
    scaledOptions: { control: { type: "boolean" } },
    textOverflow: { control: { type: "boolean" } },
    title: { control: { type: "text" } },
    topSpace: { control: { type: "number" } },
    type: {
      control: {
        type: "select",
        options: ["badge", "onlyIcon", "descriptive", null],
      },
    },
    usePortalBackdrop: { control: { type: "boolean" } },
    withBackdrop: { control: { type: "boolean" } },
    withBackground: { control: { type: "boolean" } },
    withBlur: { control: { type: "boolean" } },
    withLabel: { control: { type: "boolean" } },
    withoutBackground: { control: { type: "boolean" } },
    withoutPadding: { control: { type: "boolean" } },
    shouldShowBackdrop: { control: { type: "boolean" } },

    options: { table: { disable: true } },
    selectedOption: { table: { disable: true } },
    advancedOptions: { table: { disable: true } },
    advancedOptionsCount: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    comboIcon: { table: { disable: true } },
    id: { table: { disable: true } },
    dropDownId: { table: { disable: true } },
    optionStyle: { table: { disable: true } },
    setIsOpenItemAccess: { table: { disable: true } },
    role: { table: { disable: true } },
    style: { table: { disable: true } },
    tabIndex: { table: { disable: true } },
    onBackdropClick: { table: { disable: true } },
    onClickSelectedItem: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    onToggle: { table: { disable: true } },
  },
} satisfies Meta<typeof ComboBox>;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "240px", padding: "20px" }}>{children}</div>;
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
    directionY: "bottom",
    fixedDirection: true,
    isDefaultMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Default ComboBox with basic configuration.",
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
          directionY="bottom"
          scaled={false}
          fixedDirection
          isDefaultMode={false}
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
        label: "Move",
        icon: MoveReactSvgUrl,
      },
      {
        key: 2,
        label: "Copy",
        icon: CopyReactSvgUrl,
      },
      {
        key: 3,
        label: "Download",
        icon: DownloadReactSvgUrl,
      },
    ],
    selectedOption: {
      key: 0,
      label: "Select Type",
    },
    directionY: "bottom",
    fixedDirection: true,
    isDefaultMode: false,
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
    directionY: "bottom",
    fixedDirection: true,
    isDefaultMode: false,
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
    directionY: "bottom",
    fixedDirection: true,
    isDefaultMode: false,
    scaled: false,
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
