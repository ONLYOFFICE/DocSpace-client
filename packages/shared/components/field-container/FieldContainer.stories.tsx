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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { InputSize, InputType, TextInput } from "../text-input";

import { FieldContainer } from "./FieldContainer";
import { FieldContainerProps } from "./FieldContainer.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/FieldContainer",
  component: FieldContainer,
  argTypes: {
    errorColor: {
      control: "color",
      description:
        "Color used for error messages and indicators. Can be any valid CSS color value.",
    },
    labelText: {
      control: "text",
      description: "Text content of the field label",
    },
    tooltipContent: {
      control: "text",
      description:
        "Content to be displayed in the tooltip when hovering over the help icon",
    },
    maxLabelWidth: {
      control: "text",
      description:
        "Maximum width of the label element. Can be any valid CSS width value",
    },
    errorMessageWidth: {
      control: "text",
      description:
        "Width of the error message container. Can be any valid CSS width value",
    },
    place: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "Position of the tooltip relative to the help icon",
    },
    isVertical: {
      control: "boolean",
      description:
        "When true, displays label above the input field instead of beside it",
    },
    isRequired: {
      control: "boolean",
      description:
        "When true, displays a required field indicator (*) next to the label",
    },
    hasError: {
      control: "boolean",
      description:
        "When true, displays the field in an error state with error styling",
    },
    labelVisible: {
      control: "boolean",
      description: "Controls visibility of the field label",
    },
    removeMargin: {
      control: "boolean",
      description: "When true, removes the default margin around the container",
    },
    inlineHelpButton: {
      control: "boolean",
      description: "When true, displays an inline help button with tooltip",
    },
    helpButtonHeaderContent: {
      control: "text",
      description:
        "Custom header content for the help tooltip when using inline help button",
    },
    className: {
      control: "text",
      description: "Additional CSS class names to apply to the container",
    },
    style: {
      control: "object",
      description: "Custom inline styles to apply to the container",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display when hasError is true",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
A responsive form field container component that provides consistent layout and styling for form inputs.

## Features
- Horizontal and vertical layout options
- Built-in error handling and display
- Optional required field indicator
- Configurable label width
- Integrated tooltip support
- Accessibility support with ARIA attributes
`,
      },
    },
  },
} satisfies Meta<typeof FieldContainer>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ hasError, ...rest }: FieldContainerProps) => {
  const [value, setValue] = useState("");

  return (
    <FieldContainer hasError={hasError} {...rest}>
      <TextInput
        value={value}
        hasError={hasError}
        className="field-input"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
        type={InputType.text}
        size={InputSize.base}
      />
    </FieldContainer>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    labelText: "Name:",
    labelVisible: true,
    maxLabelWidth: "110px",
    tooltipContent: "Enter your full name",
    place: "top",
    errorMessage:
      "Error text. Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
    children: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Default configuration with horizontal layout and tooltip",
      },
    },
  },
};

export const Required: Story = {
  render: Template,
  args: {
    ...Default.args,
    isRequired: true,
    labelText: "Email:",
    tooltipContent: "Enter a valid email address",
  },
  parameters: {
    docs: {
      description: {
        story: "Required field with visual indicator",
      },
    },
  },
};

export const WithError: Story = {
  render: Template,
  args: {
    ...Default.args,
    hasError: true,
    errorMessage: "This field is required",
    errorColor: globalColors.lightErrorStatus,
    errorMessageWidth: "293px",
    labelText: "Username:",
  },
  parameters: {
    docs: {
      description: {
        story: "Field in error state with custom error message",
      },
    },
  },
};

export const VerticalLayout: Story = {
  render: Template,
  args: {
    ...Default.args,
    isVertical: true,
    maxLabelWidth: "100%",
    labelText: "Description:",
    tooltipContent: "Provide a brief description",
  },
  parameters: {
    docs: {
      description: {
        story: "Vertical layout with full-width label",
      },
    },
  },
};

export const WithInlineHelp: Story = {
  render: Template,
  args: {
    ...Default.args,
    inlineHelpButton: true,
    tooltipContent: "This is an inline help message",
    helpButtonHeaderContent: "Help Information",
    labelText: "Profile URL:",
  },
  parameters: {
    docs: {
      description: {
        story: "Field with inline help button and custom tooltip header",
      },
    },
  },
};

export const CustomStyling: Story = {
  render: Template,
  args: {
    ...Default.args,
    className: "custom-field",
    style: { backgroundColor: "#f5f5f5", padding: "16px", borderRadius: "4px" },
    labelText: "Custom Field:",
  },
  parameters: {
    docs: {
      description: {
        story: "Field with custom styling applied",
      },
    },
  },
};
