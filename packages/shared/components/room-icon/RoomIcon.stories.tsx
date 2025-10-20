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

import { Meta, StoryObj } from "@storybook/react";

import CollaborateImageUrl from "PUBLIC_DIR/images/notifications/collaborate.png";
import PlanetIcon from "PUBLIC_DIR/images/icons/12/planet.react.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import EditPenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import styles from "./RoomIcon.stories.module.scss";

import { RoomIcon } from ".";

const meta: Meta<typeof RoomIcon> = {
  title: "Base UI Components/RoomIcon",
  component: RoomIcon,
  parameters: {
    docs: {
      description: {
        component:
          "Room icon component with various states and editing capabilities.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["32px", "48px", "96px"],
      description: "Size of the room icon",
    },
    color: {
      control: "color",
      description: "Color of the room icon",
    },
    radius: {
      control: "text",
      description: "Border radius of the icon",
    },
    showDefault: {
      control: "boolean",
      description: "Show default state",
    },
    isArchive: {
      control: "boolean",
      description: "Archive state of the room",
    },
    withEditing: {
      control: "boolean",
      description: "Enable editing mode",
    },
    isEmptyIcon: {
      control: "boolean",
      description: "Show empty icon state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoomIcon>;

const mockModel = [
  {
    label: "Upload",
    icon: PlusSvgUrl,
    key: "upload",
    onClick: () => console.log("Upload clicked"),
  },
  {
    label: "Edit",
    icon: EditPenSvgUrl,
    key: "edit",
    onClick: () => console.log("Edit clicked"),
  },
];

export const Default: Story = {
  args: {
    title: "Test Room",
    size: "96px",
    color: "FFFFFF",
    radius: "6px",
    showDefault: true,
  },
  render: (args) => (
    <div>
      <RoomIcon
        {...args}
        className={`${styles.roomTitle} ${styles.roomBackground}`}
      />
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    ...Default.args,
    showDefault: false,
    logo: CollaborateImageUrl,
  },
};

export const WithEditing: Story = {
  args: {
    ...Default.args,
    withEditing: true,
    model: mockModel,
  },
  render: (args) => (
    <div style={{ height: "200px" }}>
      <RoomIcon
        {...args}
        className={`${styles.roomTitle} ${styles.roomBackground}`}
      />
    </div>
  ),
};

export const EmptyState: Story = {
  args: {
    ...Default.args,
    isEmptyIcon: true,
    model: mockModel,
  },
  render: (args) => (
    <div style={{ height: "200px" }}>
      <RoomIcon {...args} />
    </div>
  ),
};

export const Archive: Story = {
  args: {
    ...Default.args,
    isArchive: true,
  },
  render: (args) => (
    <div>
      <RoomIcon {...args} className={styles.roomTitle} />
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    title: "Badge",
    color: "3B72A7",
    size: "96px",
    radius: "6px",
    badgeUrl: PlanetIcon,
    onBadgeClick: () => console.log("Badge clicked"),
    withEditing: false,
    showDefault: true,
  },
  render: (args) => (
    <div
      style={{
        position: "relative",
        width: "120px",
        height: "120px",
      }}
    >
      <div
        style={{
          position: "relative",
          transformOrigin: "center",
        }}
      >
        <RoomIcon {...args} className={styles.roomTitle} />
      </div>
    </div>
  ),
};

export const WithHover: Story = {
  args: {
    ...Default.args,
    hoverSrc: "https://picsum.photos/200",
  },
  render: (args) => (
    <div>
      <RoomIcon
        {...args}
        className={`${styles.roomTitle} ${styles.roomBackground}`}
      />
    </div>
  ),
};
