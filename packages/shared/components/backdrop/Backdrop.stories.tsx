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

import { Button, ButtonSize } from "../button";

import { BackdropProps } from "./Backdrop.types";
import { Backdrop } from ".";

const meta = {
  title: "Components/Backdrop",
  component: Backdrop,
  parameters: {
    docs: {
      description: {
        component: `
A flexible backdrop component that provides a customizable overlay for modals, dialogs, and aside components.

## Features
- 🎨 Customizable background and blur effects
- 📱 Responsive design with mobile/tablet support
- 🔝 Configurable z-index for proper stacking
- 🔄 Multiple backdrop support for aside components
- 🖱️ Touch event handling for mobile devices

## Usage
The Backdrop component is designed to be highly flexible and can be used in various scenarios:
- Modal dialogs
- Side panels
- Loading overlays
- Multiple layer management
        `,
      },
    },
  },
  argTypes: {
    visible: {
      description: "Controls the visibility of the backdrop",
      control: "boolean",
      defaultValue: false,
    },
    zIndex: {
      description: "Sets the z-index CSS property for stacking context",
      control: "number",
      defaultValue: 203,
    },
    withBackground: {
      description: "Enables background visibility",
      control: "boolean",
      defaultValue: false,
    },
    isAside: {
      description: "Indicates backdrop is used with an Aside component",
      control: "boolean",
      defaultValue: false,
    },
    withoutBlur: {
      description: "Disables the blur effect",
      control: "boolean",
      defaultValue: false,
    },
    withoutBackground: {
      description: "Forces backdrop to render without background",
      control: "boolean",
      defaultValue: false,
    },
    isModalDialog: {
      description: "Indicates backdrop is used with a modal dialog",
      control: "boolean",
      defaultValue: false,
    },
    onClick: {
      description: "Click event handler for backdrop interaction",
      action: "clicked",
    },
  },
} satisfies Meta<typeof Backdrop>;

type Story = StoryObj<typeof Backdrop>;

export default meta;

// Basic backdrop with toggle button
const Template = (args: BackdropProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisible = () => setIsVisible(!isVisible);

  return (
    <>
      <Button
        label="Toggle Backdrop"
        primary
        size={ButtonSize.medium}
        onClick={toggleVisible}
      />
      <Backdrop {...args} visible={isVisible} onClick={toggleVisible} />
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#333",
            fontSize: "16px",
            zIndex: 204,
          }}
        >
          Click anywhere to close
        </div>
      )}
    </>
  );
};

// Multiple backdrops with aside example
const MultipleBackdropsTemplate = (args: BackdropProps) => {
  const [isFirstVisible, setFirstVisible] = useState(false);
  const [isSecondVisible, setSecondVisible] = useState(false);

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button
        label="First Backdrop"
        primary
        size={ButtonSize.medium}
        onClick={() => setFirstVisible(!isFirstVisible)}
      />
      <Button
        label="Second Backdrop"
        primary
        size={ButtonSize.medium}
        onClick={() => setSecondVisible(!isSecondVisible)}
      />
      <Backdrop
        {...args}
        visible={isFirstVisible}
        isAside
        onClick={() => setFirstVisible(false)}
      />
      <Backdrop
        {...args}
        visible={isSecondVisible}
        isAside
        onClick={() => setSecondVisible(false)}
      />
    </div>
  );
};

// Modal dialog example
const ModalTemplate = (args: BackdropProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisible = () => setIsVisible(!isVisible);

  return (
    <>
      <Button
        label="Show Modal"
        primary
        size={ButtonSize.medium}
        onClick={toggleVisible}
      />
      <Backdrop
        {...args}
        visible={isVisible}
        isModalDialog
        onClick={toggleVisible}
      />
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            zIndex: 204,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h2>Modal Content</h2>
          <p>Click outside to close</p>
        </div>
      )}
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    withBackground: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic backdrop with a toggle button. The backdrop appears with a background when visible.",
      },
    },
  },
};

export const WithoutBackground: Story = {
  render: (args) => <Template {...args} />,
  args: {
    withoutBackground: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Backdrop without a background. Useful when you want the backdrop to be invisible but still capture clicks.",
      },
    },
  },
};

export const MultipleBackdrops: Story = {
  render: (args) => <MultipleBackdropsTemplate {...args} />,
  args: {
    withBackground: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example showing multiple backdrops using the isAside prop. Up to two backdrops can be displayed simultaneously.",
      },
    },
  },
};

export const ModalDialog: Story = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    withBackground: true,
    isModalDialog: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example showing the backdrop used with a modal dialog. The isModalDialog prop modifies touch event handling.",
      },
    },
  },
};
