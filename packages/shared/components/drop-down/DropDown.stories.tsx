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
import { DropDownItem } from "../drop-down-item";
import { DropDown } from ".";
import type { DropDownProps } from "./DropDown.types";
import { Button } from "../button";

const meta = {
  title: "Drop down components/DropDown",
  component: DropDown,
  parameters: {
    docs: {
      description: {
        component: `A flexible dropdown component that can contain any content, typically used with DropDownItem elements.

Key features:
- Supports custom positioning (top, bottom, left, right)
- Backdrop option for modal-like behavior
- Click outside handling
- Custom width and z-index
- Supports virtual list for large datasets
- Responsive positioning based on viewport

Note: Parent element must have \`position: relative\` for proper positioning.`,
      },
    },
    layout: "centered",
  },
  argTypes: {
    directionX: {
      control: "select",
      options: ["left", "right"],
      description: "Horizontal direction of the dropdown",
    },
    directionY: {
      control: "select",
      options: ["top", "bottom"],
      description: "Vertical direction of the dropdown",
    },
    backDrop: {
      control: "boolean",
      description: "Show a backdrop behind the dropdown",
    },
    manualWidth: {
      control: "text",
      description: "Custom width for the dropdown",
    },
    zIndex: {
      control: "number",
      description: "Custom z-index for the dropdown",
    },
  },
} satisfies Meta<typeof DropDown>;

type Story = StoryObj<typeof DropDown>;

export default meta;

const ToggleDropDownTemplate = (args: DropDownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const parentRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div style={{ height: "100px", position: "relative", padding: "20px" }}>
      <Button
        ref={parentRef}
        label="Toggle Dropdown"
        onClick={() => setIsOpen(true)}
        style={{ marginBottom: "8px" }}
      />
      <DropDown
        {...args}
        open={isOpen}
        forwardedRef={parentRef}
        clickOutsideAction={() => setIsOpen(false)}
      >
        <DropDownItem isHeader label="Menu" />
        <DropDownItem label="Option 1" onClick={() => {}} />
        <DropDownItem label="Option 2" onClick={() => {}} />
        <DropDownItem label="Option 3" onClick={() => {}} />
        <DropDownItem label="Disabled Option" onClick={() => {}} disabled />
      </DropDown>
    </div>
  );
};

export const ToggleDropDown: Story = {
  render: ToggleDropDownTemplate,
  args: {
    directionX: "right",
    directionY: "bottom",
    showDisabledItems: true,
  },
};
