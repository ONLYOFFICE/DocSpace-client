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

import { SaveCancelButtons } from ".";
import { SaveCancelButtonProps } from "./SaveCancelButton.types";
import styles from "./SaveCancelButtons.stories.module.scss";

/**
 * Save and cancel buttons component with reminder text for unsaved changes.
 *
 * Features:
 * - Customizable save and cancel button labels
 * - Optional reminder text for unsaved changes
 * - Loading state for save button
 * - Keyboard navigation support (Enter to save, Escape to cancel)
 * - Full accessibility support with ARIA attributes
 * - Responsive design with mobile support
 */
const meta = {
  title: "Components/SaveCancelButtons",
  component: SaveCancelButtons,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "button-name",
            enabled: true,
          },
          {
            id: "aria-valid-attr-value",
            enabled: true,
          },
        ],
      },
    },
  },
  argTypes: {
    onSaveClick: {
      action: "onSaveClick",
      description: "Callback function triggered when save button is clicked",
    },
    onCancelClick: {
      action: "onCancelClick",
      description: "Callback function triggered when cancel button is clicked",
    },
    showReminder: {
      control: "boolean",
      description: "Controls visibility of the reminder text",
    },
    reminderText: {
      control: "text",
      description: "Text to display as reminder for unsaved changes",
    },
    saveButtonLabel: {
      control: "text",
      description: "Custom label for the save button",
    },
    cancelButtonLabel: {
      control: "text",
      description: "Custom label for the cancel button",
    },
    isSaving: {
      control: "boolean",
      description: "Controls loading state of the save button",
    },
    saveButtonDisabled: {
      control: "boolean",
      description: "Disables the save button",
    },
    cancelEnable: {
      control: "boolean",
      description:
        "Explicitly enables the cancel button regardless of other states",
    },
    displaySettings: {
      control: "boolean",
      description: "Adjusts styling for settings panel display",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SaveCancelButtons>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({
  onSaveClick,
  onCancelClick,
  ...args
}: SaveCancelButtonProps) => {
  const isAutoDocs =
    typeof window !== "undefined" && window?.location?.href.includes("docs");

  return (
    <div className={styles.wrapper}>
      <SaveCancelButtons
        {...args}
        className={
          isAutoDocs && !args.displaySettings
            ? `${styles.positionAbsolute} ${args.className || ""}`
            : args.className
        }
        onSaveClick={() => onSaveClick?.()}
        onCancelClick={() => onCancelClick?.()}
      />
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    showReminder: false,
    displaySettings: true,
    reminderText: "You have unsaved changes",
    saveButtonLabel: "Save",
    cancelButtonLabel: "Cancel",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default state of the SaveCancelButtons component without reminder text.",
      },
    },
  },
};

export const WithReminder: Story = {
  render: Template,
  args: {
    ...Default.args,
    showReminder: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "SaveCancelButtons with visible reminder text for unsaved changes.",
      },
    },
  },
};

export const Loading: Story = {
  render: Template,
  args: {
    ...Default.args,
    isSaving: true,
  },
  parameters: {
    docs: {
      description: {
        story: "SaveCancelButtons in loading state while saving changes.",
      },
    },
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    ...Default.args,
    saveButtonDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "SaveCancelButtons with disabled save button.",
      },
    },
  },
};

export const CustomLabels: Story = {
  render: Template,
  args: {
    ...Default.args,
    saveButtonLabel: "Apply Changes",
    cancelButtonLabel: "Discard",
    showReminder: true,
    reminderText: "You have pending changes",
  },
  parameters: {
    docs: {
      description: {
        story: "SaveCancelButtons with custom button labels and reminder text.",
      },
    },
  },
};
