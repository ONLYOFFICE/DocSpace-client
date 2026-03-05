// (c) Copyright Ascensio System SIA 2009-2026
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

import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { InfoBar } from ".";

const meta = {
  title: "Data Display/InfoBar",
  component: InfoBar,
  parameters: {
    docs: {
      description: {
        component:
          "An informational bar component used to display important messages, tips, or notifications with an icon, title, and description.",
      },
    },
  },
  argTypes: {
    title: {
      description: "Title text displayed in the header",
      control: "text",
    },
    description: {
      description: "Description text or content displayed in the body",
      control: "text",
    },
    icon: {
      description: "Icon URL to display in the header (default: info icon)",
      control: "text",
    },
    className: {
      description: "Additional CSS class name",
      control: "text",
    },
    dataTestId: {
      description: "Data test ID for testing",
      control: "text",
    },
  },
} satisfies Meta<typeof InfoBar>;

type Story = StoryObj<typeof InfoBar>;

export default meta;

export const Default: Story = {
  args: {
    title: "Information",
    description: "This is an informational message.",
  },
};

export const WithTitle: Story = {
  args: {
    title: "Important Notice",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with only a title, no description.",
      },
    },
  },
};

export const WithDescription: Story = {
  args: {
    description: "This is a description without a title.",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with only a description, no title.",
      },
    },
  },
};

export const WithTitleAndDescription: Story = {
  args: {
    title: "System Update",
    description:
      "A new version is available. Please save your work and restart the application.",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with both title and description.",
      },
    },
  },
};

export const WithChildren: Story = {
  args: {
    title: "Custom Content",
    description: "You can add custom elements below:",
    children: (
      <div style={{ marginTop: "8px" }}>
        <button style={{ padding: "4px 12px", cursor: "pointer" }}>
          Learn More
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with custom children elements.",
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    title: "Detailed Information",
    description:
      "This is a longer description that demonstrates how the InfoBar component handles multiple lines of text. It should wrap properly and maintain good readability even with extensive content.",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with longer text content.",
      },
    },
  },
};

export const CustomClassName: Story = {
  args: {
    title: "Custom Styled",
    description: "This InfoBar has a custom className applied.",
    className: "custom-info-bar",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoBar with custom CSS class for additional styling.",
      },
    },
  },
};
