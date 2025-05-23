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

import { Button } from "../../components/button";
import { ConflictResolveType } from "../../enums";

import ConflictResolve from "./ConflictResolve";
import { ConflictResolveProps } from "./ConflictResolve.types";

const meta = {
  title: "Dialogs/ConflictResolve",
  component: ConflictResolve,
  parameters: {
    docs: {
      description: {
        component: "Dialog for resolving file conflicts",
      },
    },
  },
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "Shows loading state",
    },
    visible: {
      control: "boolean",
      description: "Controls dialog visibility",
    },
    messageText: {
      control: "text",
      description: "Text message showing the file in conflict",
    },
    selectActionText: {
      control: "text",
      description: "Text prompting user to select an action",
    },
    submitButtonLabel: {
      control: "text",
      description: "Label for the submit button",
    },
    cancelButtonLabel: {
      control: "text",
      description: "Label for the cancel button",
    },
    headerLabel: {
      control: "text",
      description: "Header text for the dialog",
    },
    overwriteTitle: {
      control: "text",
      description: "Title for the overwrite option",
    },
    overwriteDescription: {
      control: "text",
      description: "Description for the overwrite option",
    },
    duplicateTitle: {
      control: "text",
      description: "Title for the duplicate option",
    },
    duplicateDescription: {
      control: "text",
      description: "Description for the duplicate option",
    },
    skipTitle: {
      control: "text",
      description: "Title for the skip option",
    },
    skipDescription: {
      control: "text",
      description: "Description for the skip option",
    },
  },
} satisfies Meta<typeof ConflictResolve>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }: ConflictResolveProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<ConflictResolveType | null>(
    null,
  );

  const openDialog = () => setIsVisible(true);
  const closeDialog = () => setIsVisible(false);

  const onSubmit = (type: ConflictResolveType) => {
    setSelectedType(type);
    closeDialog();
  };

  const conflictResolveTypes = {
    [ConflictResolveType.Overwrite]: "Overwrite",
    [ConflictResolveType.Duplicate]: "Duplicate",
    [ConflictResolveType.Skip]: "Skip",
  };

  return (
    <div>
      <Button label="Show Conflict Dialog" onClick={openDialog} />
      {selectedType !== null ? (
        <div style={{ marginTop: "20px" }}>
          <p>Selected action: {conflictResolveTypes[selectedType]}</p>
        </div>
      ) : null}
      <ConflictResolve
        {...args}
        visible={isVisible}
        onClose={closeDialog}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    isLoading: false,
    visible: true,
    onClose: () => {},
    onSubmit: () => {},
    messageText: "document.docx",
    selectActionText: "Select an action:",
    submitButtonLabel: "OK",
    cancelButtonLabel: "Cancel",
    overwriteTitle: "Overwrite",
    overwriteDescription: "Replace the existing file",
    duplicateTitle: "Duplicate",
    duplicateDescription: "Create a copy of the file",
    skipTitle: "Skip",
    skipDescription: "Skip this file",
    headerLabel: "Conflict Resolution",
  },
};

export const Loading: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const LongFilename: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    messageText:
      "very-long-filename-with-a-lot-of-characters-that-might-overflow-the-container.docx",
  },
};
